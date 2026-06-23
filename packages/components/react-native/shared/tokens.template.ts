/**
 * DB UX Design System – React Native design tokens
 * Color values resolved from @db-ux/core-foundations CSS custom properties at build time.
 * Import in your app: import { DBColors, DBTypography, DBSpacing } from "@db-ux/react-native-core-components";
 */

/**
 * Per-semantic badge/tag color palette resolved from CSS custom properties (light mode).
 *
 * CSS variable mapping:
 *   weakBg   ← --db-{sem}-bg-basic-level-3-default
 *   weakText ← --db-{sem}-on-bg-basic-emphasis-80-default
 *   border   ← --db-{sem}-on-bg-basic-emphasis-70-default  (same for weak and strong per CSS)
 *   strongBg ← --db-{sem}-bg-vibrant-default
 *   strongText ← --db-{sem}-on-bg-vibrant-default
 */
export const DBColorPalette = {
// @@COLOR_PALETTE@@
} as const;

/** Per-semantic badge/tag color palette — dark mode variant. */
export const DBColorPaletteDark = {
  neutral:       { weakBg: '#3b3e44', weakText: '#a6abb6', border: '#8a919e', strongBg: '#646973', strongText: '#edeef0' },
  informational: { weakBg: '#0d2535', weakText: '#60bde0', border: '#2e9acb', strongBg: '#1b6586', strongText: '#cae6fd' },
  successful:    { weakBg: '#162508', weakText: '#72bf1a', border: '#4e850f', strongBg: '#3a640e', strongText: '#c3ff9d' },
  warning:       { weakBg: '#2a1a00', weakText: '#f69400', border: '#ad6600', strongBg: '#7a4800', strongText: '#ffdbc8' },
  critical:      { weakBg: '#2a0005', weakText: '#ff5357', border: '#c00010', strongBg: '#8f0010', strongText: '#ffdada' },
  brand:         { weakBg: '#2a0005', weakText: '#ff5357', border: '#c00010', strongBg: '#8f0010', strongText: '#ffdada' },
} as const;

/**
 * Semantic color tokens for light and dark mode.
 * Use via useDBFont() context: const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
 */
export const DBTheme = {
  light: {
    bg:           '#ffffff',  // neutral[14] — page background
    bgSurface:    '#f3f3f5',  // neutral[13] — card / surface
    bgElevated:   '#edeef0',  // neutral[12] — elevated surface
    text:         '#2e3036',  // neutral[3]  — primary text
    textMuted:    '#5a5e68',  // neutral[6]  — secondary text
    textSubtle:   '#727782',  // neutral[7]  — placeholder / subtle
    textDisabled: '#c3c7ce',  // neutral[10] — disabled
    border:       '#e1e2e6',  // neutral[11] — dividers / soft borders
    borderStrong: '#727782',  // neutral[7]  — input borders
    brandPrimary: '#ec0016',  // brand red
    brandText:    '#c00010',  // brand dark red (on light bg)
    inputBg:      '#ffffff',  // neutral[14]
    switchTrack:  '#c3c7ce',  // neutral[10] — inactive switch track
    shadowColor:  '#000000',
  },
  dark: {
    bg:           '#16181b',  // neutral[1]  — page background
    bgSurface:    '#222428',  // neutral[2]  — card / surface
    bgElevated:   '#2e3036',  // neutral[3]  — elevated surface
    text:         '#edeef0',  // neutral[12] — primary text
    textMuted:    '#a6abb6',  // neutral[9]  — secondary text
    textSubtle:   '#8a919e',  // neutral[8]  — placeholder / subtle
    textDisabled: '#5a5e68',  // neutral[6]  — disabled
    border:       '#3b3e44',  // neutral[4]  — dividers
    borderStrong: '#727782',  // neutral[7]  — input borders
    brandPrimary: '#ec0016',  // brand red (unchanged)
    brandText:    '#ff5357',  // brand light red (on dark bg)
    inputBg:      '#222428',  // neutral[2]
    switchTrack:  '#484b53',  // neutral[5]  — inactive switch track
    shadowColor:  '#000000',
  },
} as const;

export type DBThemeColors = typeof DBTheme.light;

/** Neutral (grey) scale — 0 = darkest, 14 = white */
export const DBColors = {
  neutral: {
    0: '#0d0e11',
    1: '#16181b',
    2: '#222428',
    3: '#2e3036',
    4: '#3b3e44',
    5: '#484b53',
    6: '#5a5e68',
    7: '#727782',
    8: '#8a919e',
    9: '#a6abb6',
    10: '#c3c7ce',
    11: '#e1e2e6',
    12: '#edeef0',
    13: '#f3f3f5',
    14: '#ffffff',
    /** Border / neutral origin */
    origin: '#646973',
  },
  /** DB brand red */
  brand: {
    origin: '#ec0016',
    dark: '#c00010',
    light: '#ff5357',
    extraLight: '#ffdada',
  },
  /** Informational (blue) */
  informational: {
    origin: '#257fa8',
    dark: '#1b6586',
    light: '#2e9acb',
    extraLight: '#cae6fd',
  },
  /** Successful (green) */
  successful: {
    origin: '#63a615',
    dark: '#4e850f',
    light: '#72bf1a',
    extraLight: '#c3ff9d',
  },
  /** Warning (amber) */
  warning: {
    origin: '#f39200',
    dark: '#ad6600',
    light: '#f69400',
    extraLight: '#ffdbc8',
  },
  /** Critical — same hue as brand red */
  critical: {
    origin: '#ec0016',
    dark: '#c00010',
    light: '#ff5357',
    extraLight: '#ffdada',
  },
} as const;

/**
 * Font family names loaded by DBFontProvider.
 * Use these in StyleSheet to apply the DB typeface (DBNeoScreenSans).
 */
export const DBFontFamily = {
  regular:  'DBNeoScreenSans-Regular',
  medium:   'DBNeoScreenSans-Medium',
  semibold: 'DBNeoScreenSans-SemiBold',
  bold:     'DBNeoScreenSans-Bold',
} as const;

export const DBTypography = {
  size3XS: 11,
  size2XS: 12,
  sizeXS: 13,
  sizeSM: 14,
  sizeMD: 16,
  sizeLG: 20,
  sizeXL: 24,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightBold: '700' as const,
  lineHeightSM: 18,
  lineHeightMD: 20,
  lineHeightLG: 24,
} as const;

export const DBSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const DBBorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;
