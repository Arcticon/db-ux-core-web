import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBTypography, DBBorderRadius, DBSpacing } from "../../shared/tokens";
import { getBoolean } from "../../utils";
import type { DBCustomSelectListItemProps } from "./model";

function DBCustomSelectListItem(props: DBCustomSelectListItemProps) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const selected = getBoolean(props.checked);
  const disabled = getBoolean(props.disabled);
  const value = props.value ?? props.label ?? "";
  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        { borderBottomColor: c.border },
        selected && { backgroundColor: c.bgElevated },
        disabled && styles.disabled,
        pressed && !disabled && { backgroundColor: c.bgElevated },
      ]}
      onPress={!disabled ? () => { if (props.onChange) (props.onChange as any)({ target: { value, checked: !selected } }); } : undefined}
      disabled={disabled}
      accessibilityRole="menuitem"
      accessibilityState={{ selected, disabled }}
    >
      {props.type === "checkbox" ? (
        <View style={[styles.check, { borderColor: c.borderStrong }, selected && { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary }]}>
          {selected ? <DBText style={[styles.checkMark, { color: c.bg }]}>✓</DBText> : null}
        </View>
      ) : null}
      <DBText style={[styles.label, { color: c.text }, disabled && { color: c.textDisabled }]}>
        {props.label ?? props.children}
      </DBText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  disabled: { opacity: 0.4 },
  check: { width: 18, height: 18, borderWidth: 2, borderRadius: DBBorderRadius.sm, alignItems: "center", justifyContent: "center", marginRight: 10 },
  checkMark: { fontSize: 11, fontWeight: "bold" },
  label: { fontSize: DBTypography.sizeSM, flex: 1 },
});

export default DBCustomSelectListItem;
