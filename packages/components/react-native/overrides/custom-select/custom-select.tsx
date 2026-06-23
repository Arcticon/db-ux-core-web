import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Animated, View, Pressable, Modal, Platform, ScrollView, useWindowDimensions } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBTypography, DBSpacing, DBBorderRadius } from "../../shared/tokens";
import { DBCustomSelectProps } from "./model";

const SHEET_INITIAL_TRANSLATE = 400;

function mkStyles(c: typeof DBTheme.light) {
  return {
    container: { marginVertical: DBSpacing.xs },
    label: { fontSize: DBTypography.size2XS, color: c.textMuted, marginBottom: DBSpacing.xs },
    trigger: { flexDirection: "row" as const, alignItems: "center" as const, borderWidth: 1, borderColor: c.borderStrong, borderRadius: DBBorderRadius.sm, padding: 10, backgroundColor: c.inputBg },
    triggerDisabled: { borderColor: c.textDisabled, backgroundColor: c.bgSurface },
    triggerText: { flex: 1, fontSize: DBTypography.sizeSM, color: c.text },
    triggerPlaceholder: { flex: 1, fontSize: DBTypography.sizeSM, color: c.textSubtle },
    arrow: { fontSize: DBTypography.sizeSM, color: c.textMuted },
    // Bottom-sheet
    backdropFill: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" as const },
    sheet: { backgroundColor: c.inputBg, borderTopLeftRadius: DBBorderRadius.lg, borderTopRightRadius: DBBorderRadius.lg, maxHeight: "60%" as any, padding: DBSpacing.sm },
    // Dropdown panel
    dropdownBackdrop: { flex: 1, backgroundColor: "transparent" },
    dropdownPanel: {
      position: "absolute" as const,
      backgroundColor: c.bg,
      borderRadius: DBBorderRadius.sm,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden" as const,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 8,
    },
    // Option styles
    option: { flexDirection: "row" as const, alignItems: "center" as const, padding: 14, borderBottomWidth: 1, borderBottomColor: c.border },
    optionSelected: { backgroundColor: c.bgElevated },
    optionText: { fontSize: DBTypography.sizeMD, color: c.text, flex: 1 },
    optionTextSelected: { fontWeight: DBTypography.weightBold },
    // Checkbox (multi-select)
    check: { width: 20, height: 20, borderWidth: 2, borderColor: c.borderStrong, borderRadius: DBBorderRadius.sm, alignItems: "center" as const, justifyContent: "center" as const, marginRight: 10 },
    checkSelected: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
    checkMark: { color: c.bg, fontSize: 12, fontWeight: "bold" as const },
    // Single-select: only the selected row shows a filled radio
    radio: { width: 20, height: 20, borderWidth: 2, borderColor: c.brandPrimary, borderRadius: 10, alignItems: "center" as const, justifyContent: "center" as const, marginRight: 10 },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: c.brandPrimary },
    radioPlaceholder: { width: 20, marginRight: 10 },
    optionPressed: { backgroundColor: c.bgElevated },
  };
}

function DBCustomSelectFn(props: DBCustomSelectProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const { height: screenHeight } = useWindowDimensions();
  const triggerRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [panelHeight, setPanelHeight] = useState(0);

  // Fully controlled — derive selected from props every render, no internal state sync needed.
  const selected = useMemo((): string[] => {
    const v = props.values;
    if (Array.isArray(v)) return v as string[];
    if (v) return String(v).split(",").filter(Boolean);
    return [];
  }, [props.values]);

  const slideAnim = useRef(new Animated.Value(SHEET_INITIAL_TRANSLATE)).current;
  useEffect(() => {
    if (open) {
      slideAnim.setValue(SHEET_INITIAL_TRANSLATE);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0, speed: 14 }).start();
    }
  }, [open]);

  const isDropdown = (Platform.OS === "web" || Boolean(props.forceDropdown)) && !props.forceFullscreen;
  const options: any[] = Array.isArray(props.options) ? props.options : [];

  function labelFor(val: string): string {
    const opt = options.find((o) =>
      typeof o === "object" && o !== null ? String((o as any).value ?? "") === val : String(o) === val
    );
    if (!opt) return val;
    return typeof opt === "object" ? String((opt as any).label ?? val) : val;
  }

  const hasSelection = selected.length > 0;
  const display = hasSelection ? selected.map(labelFor).join(", ") : props.placeholder ?? "Select...";

  function openSelect() {
    if (isDropdown && triggerRef.current) {
      triggerRef.current.measureInWindow((x: number, y: number, width: number, height: number) => {
        setAnchorRect({ x, y, width, height });
        setOpen(true);
      });
    } else {
      setOpen(true);
    }
  }

  function handleSelect(val: string) {
    let next: string[];
    if (props.multiple) {
      next = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val];
    } else {
      next = [val];
      setOpen(false);
    }
    if ((props as any).onValueChange) (props as any).onValueChange(next.join(","));
    if (props.onOptionSelected) (props.onOptionSelected as any)(next);
  }

  const styles = mkStyles(c);

  const dropdownPanelStyle = useMemo(() => {
    const maxH = 280;
    const gap = 4;
    const spaceBelow = screenHeight - anchorRect.y - anchorRect.height - gap;
    const showAbove = panelHeight > 0 && spaceBelow < panelHeight && anchorRect.y > spaceBelow;
    return {
      ...styles.dropdownPanel,
      left: anchorRect.x,
      width: anchorRect.width,
      maxHeight: maxH,
      ...(showAbove
        ? { bottom: screenHeight - anchorRect.y + gap }
        : { top: anchorRect.y + anchorRect.height + gap }),
    };
  }, [anchorRect, screenHeight, panelHeight, styles.dropdownPanel]);

  // Inline render — no FlatList so no stale-closure risk; selected is always fresh from useMemo.
  function renderOption(item: any, i: number) {
    const val = typeof item === "object" && item !== null ? String((item as any).value ?? i) : String(item ?? i);
    const lbl = typeof item === "object" && item !== null ? String((item as any).label ?? val) : val;
    const isSel = selected.includes(val);
    return (
      <Pressable
        key={val || String(i)}
        style={({ pressed }) => [styles.option, isSel && styles.optionSelected, pressed && styles.optionPressed]}
        onPress={() => handleSelect(val)}
      >
        {props.multiple && (
          <View style={[styles.check, isSel && styles.checkSelected]}>
            {isSel && <DBText style={styles.checkMark}>✓</DBText>}
          </View>
        )}
        <DBText style={[styles.optionText, isSel && styles.optionTextSelected]}>{lbl}</DBText>
      </Pressable>
    );
  }

  return (
    <View style={styles.container} ref={component}>
      {props.label && <DBText style={styles.label}>{props.label}</DBText>}
      <Pressable
        ref={triggerRef}
        style={({ pressed }) => [styles.trigger, Boolean(props.disabled) && styles.triggerDisabled, pressed && { opacity: 0.8 }]}
        onPress={() => !Boolean(props.disabled) && openSelect()}
        accessibilityRole="combobox"
        accessibilityState={{ expanded: open }}
      >
        <DBText style={hasSelection ? styles.triggerText : styles.triggerPlaceholder}>{display}</DBText>
        <DBText style={styles.arrow}>{open ? "▴" : "▾"}</DBText>
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        {isDropdown ? (
          <Pressable style={styles.dropdownBackdrop} onPress={() => setOpen(false)}>
            <Pressable
              style={dropdownPanelStyle}
              onPress={(e) => e.stopPropagation()}
              onLayout={(e) => setPanelHeight(e.nativeEvent.layout.height)}
            >
              <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
                {options.map(renderOption)}
              </ScrollView>
            </Pressable>
          </Pressable>
        ) : (
          <Pressable style={styles.backdropFill} onPress={() => setOpen(false)}>
            <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
              <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
                {options.map(renderOption)}
              </ScrollView>
            </Animated.View>
          </Pressable>
        )}
      </Modal>
      {props.children}
    </View>
  );
}

const DBCustomSelect = forwardRef<View, DBCustomSelectProps>(DBCustomSelectFn);
export default DBCustomSelect;
