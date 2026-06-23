import React from "react";
import { Pressable, StyleSheet } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBTypography } from "../../shared/tokens";
import type { DBTabItemProps } from "./model";

function DBTabItem(props: DBTabItemProps) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const selected = Boolean(props.active);
  const isFull = Boolean((props as any)._full);
  const alignment: "start" | "center" = (props as any)._alignment ?? "start";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        isFull && styles.itemFull,
        selected ? { borderBottomColor: c.brandPrimary } : { borderBottomColor: "transparent" },
        pressed && { opacity: 0.75 },
      ]}
      onPress={() => {
        const handler = (props.onChange ?? (props as any).onSelect) as any;
        handler?.();
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
    >
      <DBText style={[
        styles.label,
        { color: selected ? c.text : c.textMuted },
        selected && styles.labelSelected,
        alignment === "center" && styles.labelCenter,
      ]}>
        {props.label ?? props.children}
      </DBText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
    marginRight: 4,
  },
  itemFull: { flex: 1, marginRight: 0 },
  label: { fontSize: DBTypography.sizeSM },
  labelSelected: { fontWeight: "bold" },
  labelCenter: { textAlign: "center" },
});

export default DBTabItem;
