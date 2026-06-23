import React from "react";
import { View, StyleSheet } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBColorPalette, DBColorPaletteDark, DBTypography, DBSpacing, DBBorderRadius } from "../../shared/tokens";
import type { DBBadgeProps } from "./model";

type SemanticKey = keyof typeof DBColorPalette;

function DBBadge(props: DBBadgeProps) {
  const { isDark } = useDBFont();
  const semantic: SemanticKey = (props.semantic as SemanticKey) ?? "adaptive";
  const isStrong = props.emphasis === "strong";
  const size = props.size ?? "small";

  const palette = (isDark ? DBColorPaletteDark : DBColorPalette)[semantic as keyof typeof DBColorPaletteDark] ?? (isDark ? DBColorPaletteDark : DBColorPalette).neutral;
  const bgColor     = isStrong ? palette.strongBg   : palette.weakBg;
  const textColor   = isStrong ? palette.strongText : palette.weakText;
  const borderColor = palette.border;
  const fontSize    = size === "medium" ? DBTypography.size2XS : DBTypography.size3XS;
  const px          = size === "medium" ? DBSpacing.sm : DBSpacing.xs;

  return (
    <View style={[styles.base, { backgroundColor: bgColor, paddingHorizontal: px, borderColor }]}>
      <DBText style={[styles.text, { color: textColor, fontSize }]}>
        {props.text ?? props.children}
      </DBText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: DBBorderRadius.full,
    borderWidth: 1,
    paddingVertical: 2,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: DBTypography.weightBold,
  },
});

export default DBBadge;
