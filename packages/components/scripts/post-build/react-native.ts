import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync
} from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
const _require = createRequire(import.meta.url);
const transform = _require('css-to-react-native').default as (
	tuples: [string, string][]
) => Record<string, string | number>;

/** Absolute path to the monorepo root (packages/components/scripts/post-build → ../../../../) */
const REPO_ROOT = resolve(process.cwd(), '../..');

const TMP_SRC = join(REPO_ROOT, 'output/tmp/react-native/react/src');
const RN_DEST = join(REPO_ROOT, 'output/react-native/src');

// Paths used by the CSS → StyleSheet pipeline
const FOUNDATIONS_PKG = join(REPO_ROOT, 'packages/foundations');
const COMPONENTS_PKG = resolve(process.cwd()); // packages/components (cwd when tsx runs)
const COMPONENTS_CSS_BUILD = join(COMPONENTS_PKG, 'build/components');
const DB_THEME_DEFAULT_VARS = join(
	REPO_ROOT,
	'node_modules/@db-ux/db-theme/build/styles/_default_variables.scss'
);
const DB_THEME_ABSOLUTE_CSS = join(
	REPO_ROOT,
	'node_modules/@db-ux/db-theme/build/styles/absolute.css'
);

// CSS build helpers — compile foundations SCSS then component SCSS

function buildFoundationsCSS(): void {
	console.log('  [css-build] compiling foundations SCSS...');
	const root = join(FOUNDATIONS_PKG, '../..');
	const opts = { cwd: root, stdio: 'inherit' as const };
	// Run the proper build steps via npm workspace scripts (handles normalize copy etc.)
	execSync('npm -w @db-ux/core-foundations run copy-prepare:normalize', opts);
	execSync('npm -w @db-ux/core-foundations run build:02_copy', opts);
	execSync('npm -w @db-ux/core-foundations run build:03_css', opts);
	console.log('  [css-build] foundations OK');
}

function buildComponentsCSS(): void {
	console.log('  [css-build] compiling component SCSS...');
	const root = join(COMPONENTS_PKG, '../..');
	execSync(
		'npm -w @db-ux/core-components run build-style:01_sass',
		{ cwd: root, stdio: 'inherit' as const }
	);
	console.log('  [css-build] components OK');
}

// CSS variable map — parses all foundations + db-theme CSS to resolve tokens

type CSSVarMap = Record<string, string>;

/** Parse CSS custom property declarations from any CSS/SCSS source text */
function parseCSSVars(src: string, map: CSSVarMap): void {
	for (const match of src.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) {
		const name = match[1].trim();
		if (!(name in map)) map[name] = match[2].trim();
	}
}

function buildCSSVarMap(): CSSVarMap {
	const map: CSSVarMap = {};

	// 1. Base palette from db-theme (hex colors, spacing values, etc.)
	if (existsSync(DB_THEME_DEFAULT_VARS)) {
		parseCSSVars(readFileSync(DB_THEME_DEFAULT_VARS, 'utf-8'), map);
	}

	// 2. @property initial-value blocks from absolute.css (covers numbers/lengths)
	if (existsSync(DB_THEME_ABSOLUTE_CSS)) {
		const src = readFileSync(DB_THEME_ABSOLUTE_CSS, 'utf-8');
		for (const block of src.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]+)\}/gs)) {
			const varName = block[1];
			const iv = block[2].match(/initial-value\s*:\s*([^;]+);/);
			if (iv && !(varName in map)) map[varName] = iv[1].trim();
		}
	}

	// 3. Foundations built CSS (adaptive/semantic color aliases)
	//    These reference the base palette via light-dark() — we extract light values.
	const foundationsDefaultsDir = join(FOUNDATIONS_PKG, 'build/styles/defaults');
	const foundationsCSSFiles = [
		join(FOUNDATIONS_PKG, 'build/styles/bundle.css'),
		join(foundationsDefaultsDir, 'default-required.css'),
		join(foundationsDefaultsDir, 'default-root.css'),
		join(foundationsDefaultsDir, 'default-elevation.css'),
	];
	for (const f of foundationsCSSFiles) {
		if (existsSync(f)) parseCSSVars(readFileSync(f, 'utf-8'), map);
	}

	return map;
}

/**
 * Resolve all `var(--db-*)` references in a CSS value.
 * Also resolves `light-dark(light, dark)` by picking the light (first) value.
 */
function resolveCSSValue(value: string, varMap: CSSVarMap, depth = 0): string {
	if (depth > 10) return value;

	// Normalize whitespace (multi-line values from SCSS output)
	let result = value.replace(/[\n\r\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

	// Strip !important
	result = result.replace(/\s*!important\s*$/, '').trim();

	// Skip color-mix() — these are dynamic browser-only values, no RN equivalent
	if (result.includes('color-mix(')) return '';

	// Resolve light-dark(light, dark) → take first (light) arg using paren-balanced scan
	result = result.replace(/light-dark\(/g, '\x00LIGHTDARK\x00(');
	result = result.replace(/\x00LIGHTDARK\x00\(([^]*)/s, (_m, rest) => {
		// Walk 'rest' to find the top-level comma, respecting nested ()
		let d = 1, i = 0;
		let firstCommaAt = -1;
		let closeAt = -1;
		while (i < rest.length && d > 0) {
			if (rest[i] === '(') d++;
			else if (rest[i] === ')') { d--; if (d === 0) { closeAt = i; break; } }
			else if (rest[i] === ',' && d === 1 && firstCommaAt < 0) firstCommaAt = i;
			i++;
		}
		const lightVal = firstCommaAt >= 0
			? rest.slice(0, firstCommaAt).trim()
			: (closeAt >= 0 ? rest.slice(0, closeAt).trim() : rest.trim());
		const after = closeAt >= 0 ? rest.slice(closeAt + 1) : '';
		return lightVal + after;
	});

	// Resolve var(--name, fallback) — use paren-balanced extraction for fallback
	result = result.replace(/var\(\s*(--[\w-]+)\s*(?:,([^)]*(?:\([^)]*\)[^)]*)*))?\)/g, (_m, name, fallback) => {
		const resolved = varMap[name];
		if (resolved) return resolveCSSValue(resolved, varMap, depth + 1);
		if (fallback) return resolveCSSValue(fallback.trim(), varMap, depth + 1);
		return _m;
	});

	return result;
}

// CSS property → React Native style conversion (via css-to-react-native)
type RNStyleObject = Record<string, string | number>;

// Properties that are web-only and should be silently dropped before passing
// to css-to-react-native (the library throws on unknowns).
const CSS_SKIP_PROPS = new Set([
	'display', 'cursor', 'transition', 'animation', 'animation-name',
	'animation-duration', 'animation-timing-function', 'animation-fill-mode',
	'transform', 'transform-origin', 'filter', 'box-shadow', 'box-sizing',
	'outline', 'resize', 'appearance', 'pointer-events', 'user-select',
	'white-space', 'word-break', 'overflow-wrap', 'word-wrap',
	'vertical-align', 'content', 'list-style', 'list-style-type',
	'visibility', 'clip', 'clip-path', 'will-change', 'contain',
	'isolation', 'mix-blend-mode', 'backdrop-filter', 'scroll-behavior',
	'scrollbar-width', 'scrollbar-color', 'text-overflow', 'text-shadow',
	'text-decoration-line', 'text-decoration-color', 'text-decoration-thickness',
	'text-underline-offset', 'columns', 'column-count',
	'float', 'clear', 'grid', 'grid-template', 'grid-area',
	'grid-column', 'grid-row', 'grid-template-areas', 'grid-template-columns',
	'grid-template-rows', 'place-items', 'place-content',
	'inset', 'inset-block', 'inset-inline',
	'inset-block-start', 'inset-block-end',
	'inset-inline-start', 'inset-inline-end',
	'border-block', 'border-inline', 'font',
	// text-align is only valid on Text nodes in RN, skip to avoid View warnings
	'text-align', 'text-align-last',
	// text-decoration sub-properties not supported in RN (only textDecorationLine is)
	'text-decoration-color', 'text-decoration-style', 'text-decoration-thickness',
	'text-decoration-line', 'text-decoration-skip-ink',
]);

// CSS logical properties → their RN equivalents (pre-mapped before transform)
const LOGICAL_PROP_MAP: Record<string, string> = {
	'padding-inline': 'padding-horizontal',
	'padding-block': 'padding-vertical',
	'padding-inline-start': 'padding-start',
	'padding-inline-end': 'padding-end',
	'padding-block-start': 'padding-top',
	'padding-block-end': 'padding-bottom',
	'margin-inline': 'margin-horizontal',
	'margin-block': 'margin-vertical',
	'margin-inline-start': 'margin-start',
	'margin-inline-end': 'margin-end',
	'margin-block-start': 'margin-top',
	'margin-block-end': 'margin-bottom',
	'inline-size': 'width',
	'block-size': 'height',
	'min-inline-size': 'min-width',
	'max-inline-size': 'max-width',
	'min-block-size': 'min-height',
	'max-block-size': 'max-height',
};

// RN position only supports 'absolute' | 'relative' — 'fixed'/'sticky' must be dropped
const SKIP_PROP_VALUES: Record<string, Set<string>> = {
	'position': new Set(['fixed', 'sticky']),
};

// Values that are CSS-only and should be skipped
const SKIP_VALUES = new Set(['fit-content', 'max-content', 'min-content', 'auto', 'normal', 'inherit', 'unset', 'revert', 'initial']);

/** Convert rem/em/px strings to numbers in a transform result. */
function normalizeStyleValues(styles: Record<string, unknown>): RNStyleObject {
	const result: RNStyleObject = {};
	for (const [key, val] of Object.entries(styles)) {
		if (typeof val === 'number') {
			result[key] = val;
		} else if (typeof val === 'string') {
			const remMatch = val.match(/^(-?[\d.]+)rem$/);
			if (remMatch) { result[key] = Math.round(parseFloat(remMatch[1]) * 16); continue; }
			const pxMatch = val.match(/^(-?[\d.]+)px$/);
			if (pxMatch) { result[key] = parseFloat(pxMatch[1]); continue; }
			const emMatch = val.match(/^(-?[\d.]+)em$/);
			if (emMatch) { result[key] = Math.round(parseFloat(emMatch[1]) * 14); continue; }
			// Drop multi-value strings (e.g. "0.5rem 1rem") or unresolved units
			if (/[\d]+(rem|em|px)\s+[\d]/.test(val)) continue;
			if (/ /.test(val) && /\d+(rem|em|px)/.test(val)) continue;
			// Drop multi-word keyword values (e.g. "hidden auto") — RN needs single keywords
			if (/ /.test(val) && /^[a-z-]+ [a-z-]/.test(val)) continue;
			result[key] = val;
		}
	}
	return result;
}

/**
 * Converts a single CSS declaration (property + resolved value) to a RN style
 * object using css-to-react-native. Returns {} on failure or unsupported prop.
 */
function cssDeclarationToRN(prop: string, value: string): RNStyleObject {
	prop = prop.trim().toLowerCase();
	value = value.trim();

	// Drop CSS custom properties, web-only, and any grid-* properties
	if (prop.startsWith('--') || prop.startsWith('grid-') || CSS_SKIP_PROPS.has(prop)) return {};

	// Drop unresolvable or web-only values
	if (value.includes('var(') || value.includes('calc(')) return {};
	if (!value || SKIP_VALUES.has(value)) return {};
	// Drop prop+value combos that are invalid in RN (e.g. position: fixed)
	if (SKIP_PROP_VALUES[prop]?.has(value)) return {};

	// Map CSS logical properties to the RN-compatible names transform understands
	const mappedProp = LOGICAL_PROP_MAP[prop] ?? prop;

	try {
		const raw = transform([[mappedProp, value]]);
		return normalizeStyleValues(raw);
	} catch {
		return {};
	}
}

// CSS rule extractor — parses compiled CSS and produces per-class RN styles
interface ParsedRule {
	/** e.g. "db-badge" */
	className: string;
	/** data attribute name if selector is .db-xxx[data-yyy=zzz] */
	dataAttr?: string;
	/** data attribute value */
	dataValue?: string;
	styles: RNStyleObject;
}

/**
 * Walk a CSS string extracting top-level rule blocks using brace balancing.
 * At-rules (@layer, @media, @keyframes, etc.) are skipped entirely.
 */
function extractTopLevelRules(css: string): Array<{ selector: string; declarations: string }> {
	const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
	const result: Array<{ selector: string; declarations: string }> = [];
	let i = 0;
	const len = stripped.length;

	while (i < len) {
		while (i < len && /\s/.test(stripped[i])) i++;
		if (i >= len) break;

		const start = i;
		while (i < len && stripped[i] !== '{' && stripped[i] !== ';') i++;
		if (i >= len) break;

		if (stripped[i] === ';') { i++; continue; }

		const selector = stripped.slice(start, i).trim();
		i++; // skip '{'

		let depth = 1;
		const bodyStart = i;
		while (i < len && depth > 0) {
			if (stripped[i] === '{') depth++;
			else if (stripped[i] === '}') depth--;
			i++;
		}
		const body = stripped.slice(bodyStart, i - 1);

		if (selector.startsWith('@')) continue;

		result.push({ selector, declarations: body });
	}

	return result;
}

/**
 * Parses a CSS file and returns all rules matching simple \`.db-{name}\` selectors
 * (optionally with a single \`[data-attr=value]\` modifier).
 * Pseudo-classes, pseudo-elements, and multi-class selectors are skipped.
 */
function parseCSSRules(cssContent: string, varMap: CSSVarMap): ParsedRule[] {
	const rules: ParsedRule[] = [];

	for (const { selector, declarations } of extractTopLevelRules(cssContent)) {
		for (const rawSel of selector.split(',')) {
			const sel = rawSel.trim();

			const simpleMatch = sel.match(
				/^\.(db-[\w-]+)(?:\[data-([\w-]+)=["'"]?([\w-]+)["'"]?\])?$/
			);
			if (!simpleMatch) continue;
			if (/[: >+~]/.test(sel)) continue;

			const className = simpleMatch[1];
			const dataAttr = simpleMatch[2];
			const dataValue = simpleMatch[3];

			const styles: RNStyleObject = {};
			for (const decl of declarations.split(';')) {
				const colon = decl.indexOf(':');
				if (colon < 0) continue;
				const prop = decl.slice(0, colon).trim();
				const val = decl.slice(colon + 1).trim();
				if (!prop || !val) continue;
				const resolved = resolveCSSValue(val, varMap);
				Object.assign(styles, cssDeclarationToRN(prop, resolved));
			}

			if (Object.keys(styles).length > 0) {
				rules.push({ className, dataAttr, dataValue, styles });
			}
		}
	}

	return rules;
}


/**
 * For a given component name, reads its compiled CSS and returns a map of
 * StyleSheet keys → RN style objects.
 *
 * Keys:
 *   - "db-xxx"               → base styles for .db-xxx
 *   - "db-xxx__attr__value"  → additional styles for .db-xxx[data-attr=value]
 */
function buildComponentStyles(
	componentName: string,
	varMap: CSSVarMap
): Record<string, RNStyleObject> {
	const cssFile = join(COMPONENTS_CSS_BUILD, componentName, `${componentName}.css`);
	if (!existsSync(cssFile)) return {};

	const css = readFileSync(cssFile, 'utf-8');
	const rules = parseCSSRules(css, varMap);
	const result: Record<string, RNStyleObject> = {};

	for (const rule of rules) {
		const key = rule.dataAttr
			? `${rule.className}__${rule.dataAttr}__${rule.dataValue}`
			: rule.className;

		if (!result[key]) {
			result[key] = { ...rule.styles };
		} else {
			Object.assign(result[key], rule.styles);
		}
	}

	return result;
}

/**
 * Renders a StyleSheet.create({...}) source string from a style map.
 * Used for injection into generated component files.
 */
function renderStyleSheet(styleMap: Record<string, RNStyleObject>): string {
	const entries = Object.entries(styleMap);
	if (entries.length === 0) return 'const styles = StyleSheet.create({});\n';

	const lines: string[] = ['const styles = StyleSheet.create({'];
	for (const [key, styles] of entries) {
		const safeKey = /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `"${key}"`;
		lines.push(`  ${safeKey}: {`);
		for (const [prop, val] of Object.entries(styles)) {
			const serialized = typeof val === 'string' ? `"${val}"` : String(val);
			lines.push(`    ${prop}: ${serialized},`);
		}
		lines.push('  },');
	}
	lines.push('});\n');
	return lines.join('\n');
}

// Global text transformations applied to every generated TSX file

const REMOVE_PATTERNS: RegExp[] = [
	/^"use client";\n?/m,
	/^ import \{ filterPassingProps, getRootProps \} from "\.\.\/\.\.\/utils\/react";\n?/m,
	/import \{[^}]*(?:addValueResetEventListener|addCheckedResetEventListener|addResetEventListener)[^}]*\} from "\.\.\/\.\.\/utils\/form-components";\n?/g,
	/import \{[^}]*(?:handleFrameworkEventAngular|handleFrameworkEventVue)[^}]*\} from "\.\.\/\.\.\/utils\/form-components";\n?/g,
	/import \{ ?DocumentScrollListener ?\} from "\.\.\/\.\.\/utils\/document-scroll-listener";\n?/g,
	/import \{ ?handleFixedPopover ?\} from "\.\.\/\.\.\/utils\/floating-components";\n?/g,
	/import \{ ?isEventTargetNavigationItem ?\} from "\.\.\/\.\.\/utils\/navigation";\n?/g,
	/import \{[^}]*addAttributeToChildren[^}]*\} from "\.\.\/\.\.\/utils";\n?/g,
	// Remove filterPassingProps / getRootProps spread lines from JSX
	/[ \t]*\{\.\.\.filterPassingProps\(props,\[[^\]]*\]\)\}\n?/g,
	/[ \t]*\{\.\.\.getRootProps\(props,\[[^\]]*\]\)\}\n?/g,
	// Remove id prop with propOverrides pattern
	/[ \t]*id=\{props\.id \?\? props\.propOverrides\?\.id\}\n?/g,
	// Remove data-* attribute lines from JSX
	/[ \t]*data-[a-zA-Z-]+=\{[^}]+\}\n?/g,
	/[ \t]*data-[a-zA-Z-]+="[^"]*"\n?/g,
	// Remove aria-* lines
	/[ \t]*aria-[a-zA-Z-]+=\{[^}]+\}\n?/g,
	/[ \t]*aria-[a-zA-Z-]+="[^"]*"\n?/g,
	/[ \t]*tabIndex=\{[^}]+\}\n?/g,
	// Remove web-only util calls
	/[ \t]*handleFrameworkEventAngular\([^)]*\);\n?/g,
	/[ \t]*handleFrameworkEventVue\([^)]*\);\n?/g,
	/[ \t]*addValueResetEventListener\([\s\S]*?\);\n?/g,
	/[ \t]*addCheckedResetEventListener\([\s\S]*?\);\n?/g,
	/[ \t]*addResetEventListener\([\s\S]*?\);\n?/g,
	// Remove document/window calls
	/[ \t]*document\.[^;]+;\n?/g,
	/[ \t]*window\.[^;]+;\n?/g,
	// Remove hasVoiceOver blocks
	/[ \t]*if \(hasVoiceOver\(\)\) \{[^}]+\}\n?/g,
	// Remove isIOSSafari blocks
	/[ \t]*if \(isIOSSafari\(\)\) \{[^}]+\}\n?/g,
	// Remove addAttributeToChildren calls
	/[ \t]*addAttributeToChildren\([^;]+\);\n?/g,
	// Remove querySelector / DOM method calls
	/[ \t]*const [a-zA-Z_]+ = _ref\.current\??\.(querySelector|querySelectorAll|getElementsByClassName)[^;]+;\n?/g,
	// Remove MutationObserver / ResizeObserver
	/[ \t]*(?:const )?observer = new (?:MutationObserver|ResizeObserver)\([^;]+;\n?/g,
	/[ \t]*observer\.(observe|disconnect)\([^;]*\);\n?/g
];

const REPLACEMENTS: Array<[RegExp | string, string]> = [
	// Patch DOM-only observer types in model files (not in lib: ["es2022"])
	[/_resizeObserver\?: ResizeObserver;/g, '_resizeObserver?: unknown;'],
	[/_observer\?: IntersectionObserver;/g, '_observer?: unknown;'],
	// Fix React import — hooks are imported from react, RN components imported separately
	[
		`import * as React from "react";`,
		`import React, { useRef, useState, useEffect, forwardRef, useId } from "react";
import { View, TouchableOpacity, TextInput, ScrollView, Modal, Pressable, SafeAreaView, StyleSheet, Image } from "react-native";
import DBText from "../text/text";
import * as Linking from "expo-linking";`
	],
	// Remove the duplicated hook import lines mitosis generates
	[/^import \{ [^}]+ \} from "react";\n?/gm, ''],
	[/^import \{ useId \} from "react";\n?/gm, ''],

	// --- forwardRef / function signature type cleanup ---
	[/Omit<\w*HTMLAttributes<HTML\w+Element \| any>, keyof \w+> & /g, ''],
	[/Omit<AnchorHTMLAttributes<HTMLAnchorElement \| any>, keyof \w+> & /g, ''],
	// forwardRef type arg: HTML*Element → View
	[/forwardRef<\nHTML\w+Element \| any,\n[^>]+>/g,
		(m: string) => m.replace(/HTML\w+Element \| any/, 'View')],
	[/forwardRef<HTML\w+Element \| any,/g, 'forwardRef<View,'],

	// --- HTML element → RN/Expo ---
	// Block containers
	[/<(div|section|nav|menu|ul|ol|li|main|footer|article|aside|figure|figcaption)\b([^>]*)>/g, '<View$2>'],
	[/<\/(div|section|nav|menu|ul|ol|li|main|footer|article|aside|figure|figcaption)>/g, '</View>'],
	// header HTML element (not DBHeader component)
	[/<header\b([^>]*)>/g, '<View$1>'],
	[/<\/header>/g, '</View>'],
	// span → View
	[/<span\b([^>]*)>/g, '<View$1>'],
	[/<\/span>/g, '</View>'],
	// button → Pressable
	[/<button\b([^>]*)>/g, '<Pressable$1>'],
	[/<\/button>/g, '</Pressable>'],
	// input (self-closing) → TextInput
	[/<input\b([^/>]*)\/?>/g, '<TextInput$1/>'],
	// textarea → TextInput multiline
	[/<textarea\b([^>]*)>/g, '<TextInput multiline$1>'],
	[/<\/textarea>/g, '</TextInput>'],
	// label → Text
	[/<label\b([^>]*)>/g, '<Text$1>'],
	[/<\/label>/g, '</DBText>'],
	// anchor → Pressable
	[/<a\b([^>]*)>/g, '<Pressable$1>'],
	[/<\/a>/g, '</Pressable>'],
	// dialog → Modal
	[/<dialog\b([^>]*)>/g, '<Modal$1>'],
	[/<\/dialog>/g, '</Modal>'],
	// img → Image
	[/<img\b([^/>]*)\/?>/g, '<Image$1/>'],
	// select/option → View
	[/<select\b([^>]*)>/g, '<View$1>'],
	[/<\/select>/g, '</View>'],
	[/<option\b([^>]*)>/g, '<View$1>'],
	[/<\/option>/g, '</View>'],

	// --- Events ---
	[/\bonClick=/g, 'onPress='],
	[/\bonChange=/g, 'onChange='],
	[/\bonInput=/g, 'onChangeText='],

	// --- className → removed (no-op via utils.cls) ---
	[/[ \t]*className=\{[^}]+\}\n?/g, '\n'],

	// --- Strip HTML-only props ---
	[/[ \t]*type=\{getButtonType\(\)\}\n?/g, '\n'],
	[/[ \t]*type="[^"]*"\n?/g, '\n'],
	[/[ \t]*form=\{[^}]+\}\n?/g, '\n'],
	[/[ \t]*name=\{[^}]+\}\n?/g, '\n'],
	[/[ \t]*referrerPolicy=\{[^}]+\}\n?/g, '\n'],
	[/[ \t]*hrefLang=\{[^}]+\}\n?/g, '\n'],
	[/[ \t]*target=\{[^}]+\}\n?/g, '\n'],
	[/[ \t]*rel=\{[^}]+\}\n?/g, '\n'],
	[/[ \t]*role=\{[^}]+\}\n?/g, '\n'],
	[/[ \t]*href=\{[^}]+\}\n?/g, '\n'],
	// disabled / checked / required → Boolean()
	[/disabled=\{getBoolean\(props\.disabled, "disabled"\)\}/g, 'disabled={Boolean(props.disabled)}'],
	[/required=\{getBoolean\(props\.required, "required"\)\}/g, ''],
	[/checked=\{getBoolean\(props\.checked, "checked"\)\}/g, 'value={Boolean(props.checked)}'],
	// Generic getBoolean
	[/getBoolean\(([^,)]+),\s*"[^"]+"\)/g, 'Boolean($1)'],
	// getBooleanAsString → String
	[/getBooleanAsString\(([^)]+)\)/g, 'String($1)'],
	// Fix useRef types
	[/component \|\| useRef<HTML\w+Element \| any>\(component\)/g, 'component || useRef<View>(null)'],
	[/useRef<HTML\w+Element \| any>\(([^)]*)\)/g, 'useRef<View>($1)'],
	// Clean up blank lines
	[/\n{3,}/g, '\n\n']
];

// RN-compatible utility files — read from packages/components/react-native/

/** Root folder of hand-written React Native source files */
const RN_SRC_DIR = join(COMPONENTS_PKG, 'react-native');

const RN_UTILS               = readFileSync(join(RN_SRC_DIR, 'utils/index.ts'), 'utf-8');
const RN_FORM_COMPONENTS_UTILS = readFileSync(join(RN_SRC_DIR, 'utils/form-components.ts'), 'utf-8');
const RN_SHARED_MODEL_PATCH  = readFileSync(join(RN_SRC_DIR, 'shared/model.patch.ts'), 'utf-8');

// DB design tokens for React Native
/**
 * Resolve badge-relevant CSS custom properties for a given semantic.
 * Both weak and strong emphasis use emphasis-70 for border (per badge.css).
 */
function resolveBadgePalette(
	semantic: string,
	cssVarMap: CSSVarMap
): { weakBg: string; weakText: string; border: string; strongBg: string; strongText: string } {
	const r = (varName: string) => resolveCSSValue(`var(${varName})`, cssVarMap).trim();
	const sem = semantic === 'adaptive' ? 'adaptive' : semantic;
	return {
		weakBg:   r(`--db-${sem}-bg-basic-level-3-default`),
		weakText: r(`--db-${sem}-on-bg-basic-emphasis-80-default`),
		border:   r(`--db-${sem}-on-bg-basic-emphasis-70-default`),
		strongBg: r(`--db-${sem}-bg-vibrant-default`),
		strongText: r(`--db-${sem}-on-bg-vibrant-default`),
	};
}

function buildTokensFile(cssVarMap: CSSVarMap): string {
	const semantics = ['neutral', 'adaptive', 'brand', 'critical', 'informational', 'successful', 'warning'] as const;
	const paletteLines = semantics.map((sem) => {
		const cssKey = sem === 'brand' ? 'critical' : sem;
		const p = resolveBadgePalette(cssKey, cssVarMap);
		const pad = ' '.repeat(Math.max(0, 13 - sem.length));
		return `  ${sem}:${pad}{ weakBg: '${p.weakBg}', weakText: '${p.weakText}', border: '${p.border}', strongBg: '${p.strongBg}', strongText: '${p.strongText}' },`;
	});
	const template = readFileSync(join(RN_SRC_DIR, 'shared/tokens.template.ts'), 'utf-8');
	return template.replace('// @@COLOR_PALETTE@@', paletteLines.join('\n'));
}

// Per-component overrides — loaded from packages/components/react-native/

/** Component override files — written to output/react-native/src/components/ */
const RN_OVERRIDES_DIR = join(RN_SRC_DIR, 'overrides');

/**
 * Recursively read all .ts/.tsx files from `dir` and return a map of
 * relative-path → file-content, compatible with ALL_COMPONENT_OVERRIDES.
 */
function loadOverridesFromDir(dir: string): Record<string, string> {
	const overrides: Record<string, string> = {};
	if (!existsSync(dir)) return overrides;

	function walk(current: string, relative: string) {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			const fullPath = join(current, entry.name);
			const relPath = relative ? relative + '/' + entry.name : entry.name;
			if (entry.isDirectory()) {
				walk(fullPath, relPath);
			} else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
				overrides[relPath] = readFileSync(fullPath, 'utf-8');
			}
		}
	}

	walk(dir, '');
	console.log(`  [overrides] loaded ${Object.keys(overrides).length} files from ${dir}`);
	return overrides;
}

const COMPONENT_OVERRIDES: Record<string, string> = loadOverridesFromDir(RN_OVERRIDES_DIR);

// ALL_COMPONENT_OVERRIDES is loaded directly from packages/components/react-native/
const ALL_COMPONENT_OVERRIDES: Record<string, string> = COMPONENT_OVERRIDES;

// Transform helpers
function transformFile(content: string): string {
	let result = content;
	for (const pattern of REMOVE_PATTERNS) result = result.replace(pattern, '');
	for (const [from, to] of REPLACEMENTS) {
		if (typeof from === 'string') {
			result = result.split(from).join(to as string);
		} else {
			result = result.replace(from, to as string);
		}
	}
	result = result.replace(/\n{3,}/g, '\n\n');
	return result;
}

function ensureDir(dir: string) {
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyAndTransformDir(srcDir: string, destDir: string) {
	if (!existsSync(srcDir)) return;
	ensureDir(destDir);
	for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
		const srcPath = join(srcDir, entry.name);
		const destPath = join(destDir, entry.name);
		if (entry.isDirectory()) {
			copyAndTransformDir(srcPath, destPath);
		} else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
			const content = readFileSync(srcPath, 'utf-8');
			writeFileSync(destPath, transformFile(content), 'utf-8');
		}
	}
}

// Example-file cleanup + spec purge
function cleanExamplesAndPurgeSpecs(rootDir: string) {
	let examplesCleaned = 0;
	let specsPurged = 0;

	function walk(dir: string) {
		if (!existsSync(dir)) return;
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const fullPath = join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
			} else if (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.spec.tsx') || entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) {
				unlinkSync(fullPath);
				specsPurged++;
			} else if (entry.name.endsWith('.example.tsx') || entry.name.endsWith('.example.ts') ||
			entry.name.endsWith('.showcase.tsx') || entry.name.endsWith('.showcase.ts')) {
				let src = readFileSync(fullPath, 'utf-8');
				// Remove className prop (no meaning in RN)
				src = src.replace(/\s+className="[^"]*"/g, '');
				src = src.replace(/\s+className=\{[^}]*\}/g, '');
				// Convert WAI-ARIA role= to accessibilityRole= (only plain string values)
				src = src.replace(/\brole="([^"]+)"/g, 'accessibilityRole="$1"');
				// Remove HTMLInputElement / HTMLElement type casts in examples
				src = src.replace(/ as HTML\w+Element/g, '');
				src = src.replace(/\(event\.target as HTML\w+Element\)\./g, '(event as any).');
				writeFileSync(fullPath, src, 'utf-8');
				examplesCleaned++;
			}
		}
	}

	walk(rootDir);
	console.log(`  [examples] cleaned ${examplesCleaned} example files, purged ${specsPurged} spec files`);
}

// Entry point

export default function reactNative(_tmp?: boolean) {
	try {
		console.log(`[RN] src:  ${TMP_SRC}`);
		console.log(`[RN] dest: ${RN_DEST}`);

		// Step 0: Build foundations + component CSS for StyleSheet conversion
		buildFoundationsCSS();
		buildComponentsCSS();

		// Build CSS variable map once (used for all components)
		console.log('  [css→rn] building CSS variable map...');
		const cssVarMap = buildCSSVarMap();
		console.log(`  [css→rn] ${Object.keys(cssVarMap).length} CSS variables loaded`);

		copyAndTransformDir(TMP_SRC, RN_DEST);

		// Write design tokens file
		const sharedDir = join(RN_DEST, 'shared');
		ensureDir(sharedDir);
		writeFileSync(join(sharedDir, 'tokens.ts'), buildTokensFile(cssVarMap), 'utf-8');
		console.log('  [tokens] shared/tokens.ts');

		// Write font provider
		const providersDir = join(RN_DEST, 'providers');
		ensureDir(providersDir);
		writeFileSync(join(providersDir, 'font-provider.tsx'), readFileSync(join(RN_SRC_DIR, 'providers/font-provider.tsx'), 'utf-8'), 'utf-8');
		console.log('  [provider] providers/font-provider.tsx');

		// Copy Open Sans font files from foundations into the package assets folder
		const fontSrcDir = join(REPO_ROOT, 'packages/foundations/assets/fonts');
		const fontDestDir = join(REPO_ROOT, 'output/react-native/assets/fonts');
		ensureDir(fontDestDir);
		for (const name of ['DBNeoScreenSans-Regular', 'DBNeoScreenSans-Medium', 'DBNeoScreenSans-SemiBold', 'DBNeoScreenSans-Bold']) {
			const src  = join(fontSrcDir, `${name}.ttf`);
			const dest = join(fontDestDir, `${name}.ttf`);
			if (existsSync(src)) {
				copyFileSync(src, dest);
				console.log(`  [fonts] assets/fonts/${name}.ttf`);
			}
		}

		// Overwrite shared utilities
		const utilsDir = join(RN_DEST, 'utils');
		ensureDir(utilsDir);
		writeFileSync(join(utilsDir, 'index.ts'), RN_UTILS, 'utf-8');
		writeFileSync(join(utilsDir, 'form-components.ts'), RN_FORM_COMPONENTS_UTILS, 'utf-8');

		// Patch shared model
		const modelPath = join(RN_DEST, 'shared', 'model.ts');
		if (existsSync(modelPath)) {
			let m = readFileSync(modelPath, 'utf-8');
			m = m.replace(`import * as React from "react";\n`, '');
			// Replace @db-ux/core-foundations import with an inline stub
			// (foundations may not be built in the consumer's environment)
			m = m.replace(
				/import \{ IconTypes \} from '@db-ux\/core-foundations';\n?/g,
				'/** Stub: icon name — use any string matching the DB icon set */\nexport type IconTypes = string;\n'
			);
			m = m
				.replace(/export type ClickEvent<T> = [^;]+;/, '')
				.replace(/export type ChangeEvent<T> = [^;]+;/, '')
				.replace(/export type InputEvent<T> = [^;]+;/, '')
				.replace(/export type InteractionEvent<T> = [^;]+;/, '')
				.replace(/export type GeneralEvent<T> = [^;]+;/, '')
				.replace(/export type GeneralKeyboardEvent<T> = [^;]+;/, '');
			// Patch DOM-only types that aren't in lib: ["es2022"]
			m = m.replace(/_observer\?: IntersectionObserver;/g, '_observer?: unknown;');
			m = m.replace(/: ResizeObserver\b/g, ': unknown');
			m += RN_SHARED_MODEL_PATCH;
			writeFileSync(modelPath, m, 'utf-8');
		}

		// Stub out web-only utility files that leaked from the React output
		const webOnlyStubNames = [
			'document-click-listener.ts',
			'document-scroll-listener.ts',
			'floating-components.ts',
			'navigation.ts',
			'react.ts',
		];
		for (const filename of webOnlyStubNames) {
			const stubPath = join(utilsDir, filename);
			if (existsSync(stubPath)) {
				writeFileSync(stubPath, readFileSync(join(RN_SRC_DIR, 'utils', filename), 'utf-8'), 'utf-8');
				console.log(`  [stub] utils/${filename}`);
			}
		}

		// Write per-component overrides (auto-generated first, manual overrides on top)
		const componentsDir = join(RN_DEST, 'components');
		for (const [relPath, content] of Object.entries(ALL_COMPONENT_OVERRIDES)) {
			const destFile = join(componentsDir, relPath);
			ensureDir(join(componentsDir, relPath.split('/')[0]));
			writeFileSync(destFile, content, 'utf-8');
			console.log(`  [override] ${relPath}`);
		}

		// CSS-derived styles are now embedded directly in each component's override
		// using design token references from shared/tokens.ts — no injection needed.

		// Append font provider exports to the generated index.ts
		const indexPath = join(RN_DEST, 'index.ts');
		if (existsSync(indexPath)) {
			const indexContent = readFileSync(indexPath, 'utf-8');
			if (!indexContent.includes('providers/font-provider')) {
				writeFileSync(
					indexPath,
					indexContent +
					`\nexport { DBFontProvider, useDBFont } from './providers/font-provider';\n` +
					`export { DBColorPalette, DBColorPaletteDark, DBTheme } from './shared/tokens';\n` +
					`export type { DBThemeColors } from './shared/tokens';\n` +
					`export { default as DBText } from './components/text/text';\n` +
					`export type { DBTextProps } from './components/text/model';\n` +
					`export { default as DBIconToggle } from './components/icon-toggle/icon-toggle';\n` +
					`export type { DBIconToggleProps, DBIconToggleOption } from './components/icon-toggle/model';\n` +
					`export { default as DBDatepicker } from './components/datepicker/datepicker';\n` +
					`export type { DBDatepickerProps, DBDatepickerDefaultProps, DatepickerSizeType } from './components/datepicker/model';\n`,
					'utf-8'
				);
				console.log('  [index] appended DBFontProvider + DBColorPalette exports');
			}
		}

		// Post-process example files and purge spec/test files
		cleanExamplesAndPurgeSpecs(RN_DEST);

		console.log('[RN] Done.');
	} catch (err) {
		console.error('[RN] Error:', err);
		throw err;
	}
}
