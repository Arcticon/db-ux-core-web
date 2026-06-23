import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Animated, FlatList, Modal, Platform, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import DBText from "../text/text";
import DBInfotext from "../infotext/infotext";
import { DEFAULT_VALID_MESSAGE, DEFAULT_INVALID_MESSAGE } from "../../shared/constants";
import { stringPropVisible } from "../../utils";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBTypography, DBSpacing, DBBorderRadius } from "../../shared/tokens";
import { DBSelectOptionType, DBSelectProps } from "./model";

function mkStyles(c: typeof DBTheme.light) {
  return {
    container: { marginVertical: DBSpacing.xs },
    label: { fontSize: DBTypography.size2XS, color: c.textMuted, marginBottom: DBSpacing.xs },
    trigger: { flexDirection: "row" as const, alignItems: "center" as const, borderWidth: 1, borderColor: c.borderStrong, borderRadius: DBBorderRadius.sm, padding: 10, backgroundColor: c.inputBg },
    triggerDisabled: { borderColor: c.textDisabled, backgroundColor: c.bgSurface },
    triggerText: { flex: 1, fontSize: DBTypography.sizeSM, color: c.text },
    triggerPlaceholder: { color: c.textSubtle },
    arrow: { fontSize: DBTypography.sizeSM, color: c.textMuted },
    // Bottom-sheet mode
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" as const },
    sheet: { backgroundColor: c.inputBg, borderTopLeftRadius: DBBorderRadius.lg, borderTopRightRadius: DBBorderRadius.lg, maxHeight: "50%" as any, padding: DBSpacing.sm },
    // Dropdown mode
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
    // Shared option styles
    option: { paddingHorizontal: DBSpacing.sm, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border },
    optionSelected: { backgroundColor: c.bgElevated },
    optionText: { fontSize: DBTypography.sizeSM, color: c.text },
    optionTextSelected: { fontWeight: DBTypography.weightBold, color: c.brandPrimary },
    optionPressed: { backgroundColor: c.bgElevated },
  };
}

function DBSelectFn(props: DBSelectProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const { height: screenHeight } = useWindowDimensions();
  const triggerRef = useRef<any>(null);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(String(props.value ?? ""));
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [panelHeight, setPanelHeight] = useState(0);

  const isDropdown = (Platform.OS === "web" || Boolean(props.forceDropdown)) && !props.forceFullscreen;

  // Slide-up animation for the bottom sheet (backdrop appears instantly)
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (open && !isDropdown) {
      slideAnim.setValue(400);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 14,
      }).start();
    }
  }, [open]);

  const options: (DBSelectOptionType | string)[] = Array.isArray(props.options) ? props.options : [];
  const selectedOption = options.find((o) =>
    typeof o === "string" ? o === selected : (o as any).value === selected
  );
  const display =
    typeof selectedOption === "string"
      ? selectedOption
      : (selectedOption as any)?.label ?? selected ?? "";
  const showPlaceholder = !display && Boolean(props.placeholder);

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

  function handleSelect(option: DBSelectOptionType | string) {
    const val = typeof option === "string" ? option : (option as any).value ?? "";
    setSelected(val);
    setOpen(false);
    if (props.onChange) (props.onChange as any)({ target: { value: val } });
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

  const optionList = options.map((item, i) => {
    const val = typeof item === "string" ? item : (item as DBSelectOptionType).value ?? "";
    const lbl = typeof item === "string" ? item : (item as DBSelectOptionType).label ?? val;
    return (
      <Pressable
        key={val || String(i)}
        style={({ pressed }) => [styles.option, val === selected && styles.optionSelected, pressed && styles.optionPressed]}
        onPress={() => handleSelect(item)}
      >
        <DBText style={[styles.optionText, val === selected && styles.optionTextSelected]}>{lbl}</DBText>
      </Pressable>
    );
  });

  return (
    <View style={styles.container} ref={component}>
      {props.label && <DBText style={styles.label}>{props.label}</DBText>}
      <Pressable
        ref={triggerRef}
        style={({ pressed }) => [styles.trigger, Boolean(props.disabled) && styles.triggerDisabled, pressed && { opacity: 0.8 }]}
        onPress={() => !Boolean(props.disabled) && openSelect()}
        accessibilityRole="combobox"
        accessibilityState={{ expanded: open, disabled: Boolean(props.disabled) }}
      >
        <DBText style={[styles.triggerText, showPlaceholder && styles.triggerPlaceholder]}>
          {showPlaceholder ? props.placeholder : display}
        </DBText>
        <DBText style={styles.arrow}>▾</DBText>
      </Pressable>

      {/* animationType="none" — backdrop appears instantly, sheet slides up via Animated */}
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        {isDropdown ? (
          <Pressable style={styles.dropdownBackdrop} onPress={() => setOpen(false)}>
            <Pressable
              style={dropdownPanelStyle}
              onPress={(e) => e.stopPropagation()}
              onLayout={(e) => setPanelHeight(e.nativeEvent.layout.height)}
            >
              <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
                {optionList}
              </ScrollView>
            </Pressable>
          </Pressable>
        ) : (
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
              <FlatList
                data={options}
                keyExtractor={(item, i) => typeof item === "string" ? item : ((item as any).value ?? String(i))}
                renderItem={({ item }) => {
                  const val = typeof item === "string" ? item : (item as DBSelectOptionType).value ?? "";
                  const lbl = typeof item === "string" ? item : (item as DBSelectOptionType).label ?? val;
                  return (
                    <Pressable
                      style={({ pressed }) => [styles.option, val === selected && styles.optionSelected, pressed && styles.optionPressed]}
                      onPress={() => handleSelect(item)}
                    >
                      <DBText style={[styles.optionText, val === selected && styles.optionTextSelected]}>{lbl}</DBText>
                    </Pressable>
                  );
                }}
              />
            </Animated.View>
          </Pressable>
        )}
      </Modal>

      {props.message && (
        <DBInfotext size="small" semantic="adaptive">{props.message}</DBInfotext>
      )}
    </View>
  );
}

const DBSelect = forwardRef<View, DBSelectProps>(DBSelectFn);
export default DBSelect;
