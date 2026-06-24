import React from "react";
import { View, Pressable, StyleSheet, type PressableProps } from "react-native";
import DBText from "../text/text";
import { DBIcon } from "../icon";
import { stringPropVisible, getBoolean } from "../../utils";
import { useDBFont } from "../../providers/font-provider";
import { DBColorPalette, DBColorPaletteDark, DBTheme, DBTypography, DBSpacing, DBBorderRadius } from "../../shared/tokens";
import type { DBNotificationProps } from "./model";
import { DEFAULT_CLOSE_BUTTON } from "../../shared/constants";

type SemanticKey = keyof typeof DBColorPalette;

function DBNotification(props: DBNotificationProps) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const sem: SemanticKey = (props.semantic as SemanticKey) ?? "adaptive";
  const palette = (isDark ? DBColorPaletteDark : DBColorPalette)[sem as keyof typeof DBColorPaletteDark]
    ?? (isDark ? DBColorPaletteDark : DBColorPalette).neutral;

  const handleClose: PressableProps['onPress'] = (event) => {
    props.onClose?.(event);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: palette.weakBg,
          borderLeftColor: palette.border,
          shadowColor: c.shadowColor,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.02 : 0.05,
          shadowRadius: 3,
          elevation: 2,
        },
      ]}
      accessibilityRole="alert"
    >
      {(props.image || stringPropVisible(props.headline, props.showHeadline) || props.text || props.children || stringPropVisible(props.timestamp, props.showTimestamp) || props.link) ? (
        <View style={styles.content}>
          {props.image ? (
            <View style={styles.imageSlot}>{props.image as any}</View>
          ) : null}
          {stringPropVisible(props.headline, props.showHeadline) ? (
            <DBText style={[styles.headline, { color: c.text }]}>{props.headline}</DBText>
          ) : null}
          <DBText style={[styles.body, { color: c.text }]}>{props.text ?? props.children}</DBText>
          {stringPropVisible(props.timestamp, props.showTimestamp) ? (
            <DBText style={[styles.timestamp, { color: c.textSubtle }]}>{props.timestamp}</DBText>
          ) : null}
          {props.link ? <View>{props.link as any}</View> : null}
        </View>
      ) : null}
      {getBoolean(props.closeable, 'closeable') ? (
        <Pressable
          id={props.closeButtonId}
          style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
          onPress={handleClose}
          accessibilityLabel={props.closeButtonText ?? DEFAULT_CLOSE_BUTTON}
          accessibilityRole="button"
        >
          <DBIcon icon="close" weight="20" style={{ color: c.textMuted }} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DBBorderRadius.md,
    borderLeftWidth: 4,
    padding: DBSpacing.md,
    marginVertical: DBSpacing.xs + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: DBSpacing.sm,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  imageSlot: { marginBottom: DBSpacing.sm },
  headline: { fontSize: DBTypography.sizeMD, fontWeight: DBTypography.weightBold, marginBottom: DBSpacing.xs },
  body: { fontSize: DBTypography.sizeSM },
  timestamp: { fontSize: DBTypography.size3XS, marginTop: DBSpacing.xs },
  closeBtn: { padding: DBSpacing.xs, alignSelf: "flex-start" },
});

export default DBNotification;
