import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBSpacing, DBBorderRadius } from "../../shared/tokens";
import { DEFAULT_REMOVE } from "../../shared/constants";
import type { DBTagProps } from "./model";

function DBTag(props: DBTagProps) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const removeLabel = props.removeButton ?? DEFAULT_REMOVE;
  return (
    <View style={[styles.tag, { backgroundColor: c.bgElevated }]}>
      <DBText style={[styles.text, { color: c.text }]}>{props.content ?? props.text ?? props.children}</DBText>
      {props.behavior === "removable" ? (
        <Pressable
          style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.7 }]}
          onPress={props.onRemove as any}
          accessibilityLabel={removeLabel}
          accessibilityRole="button"
        >
          <DBText style={[styles.removeBtnText, { color: c.textMuted }]}>✕</DBText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: DBBorderRadius.full,
    paddingHorizontal: DBSpacing.sm + 2,
    paddingVertical: DBSpacing.xs,
    marginRight: DBSpacing.xs,
    marginBottom: DBSpacing.xs,
    alignSelf: "flex-start",
  },
  text: { fontSize: 13 },
  removeBtn: { marginLeft: 6, padding: 2 },
  removeBtnText: { fontSize: 12 },
});

export default DBTag;
