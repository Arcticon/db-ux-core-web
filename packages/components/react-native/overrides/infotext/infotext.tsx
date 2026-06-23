import React from "react";
import { View, StyleSheet } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBColorPalette, DBColorPaletteDark, DBTypography, DBSpacing } from "../../shared/tokens";
import type { DBInfotextProps } from "./model";

type SemanticKey = keyof typeof DBColorPalette;

function DBInfotext(props: DBInfotextProps) {
  const { isDark } = useDBFont();
  const sem: SemanticKey = (props.semantic as SemanticKey) ?? "adaptive";
  const palette = (isDark ? DBColorPaletteDark : DBColorPalette)[sem as keyof typeof DBColorPaletteDark]
    ?? (isDark ? DBColorPaletteDark : DBColorPalette).neutral;
  return (
    <View style={styles.container}>
      <DBText style={[styles.text, { color: palette.weakText }]}>{props.text ?? props.children}</DBText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: DBSpacing.xs },
  text: { fontSize: DBTypography.sizeXS },
});

export default DBInfotext;
