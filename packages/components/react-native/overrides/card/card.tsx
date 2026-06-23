import React, { useContext } from "react";
import { View, Pressable } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBBorderRadius, DBSpacing } from "../../shared/tokens";
import { DBSectionContext } from "../section/section";
import type { DBCardProps } from "./model";

function DBCard(props: DBCardProps) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const level = String(props.elevationLevel ?? "1") as "1" | "2" | "3";
  const sectionCtx = useContext(DBSectionContext);

  const elevationMap = {
    "1": {
      bg: c.bg,
      borderWidth: 1,    borderColor: c.border,
      shadowOpacity: 0,  shadowRadius: 0,  shadowOffset: { width: 0, height: 0 }, elevation: 0,
    },
    "2": {
      bg: c.bg,
      borderWidth: 0,    borderColor: "transparent" as const,
      shadowOpacity: isDark ? 0.03 : 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: isDark ? 3 : 6,
    },
    "3": {
      bg: c.bg,
      borderWidth: 0,    borderColor: "transparent" as const,
      shadowOpacity: isDark ? 0.06 : 0.14, shadowRadius: 28, shadowOffset: { width: 0, height: 12 }, elevation: isDark ? 6 : 12,
    },
  };
  const e = elevationMap[level] ?? elevationMap["1"];

  const sizeStyle = sectionCtx.isFull
    ? { flex: 1 }
    : sectionCtx.cardWidth != null
      ? { width: sectionCtx.cardWidth }
      : {};

  const cardStyle = {
    backgroundColor: e.bg,
    borderRadius: DBBorderRadius.md,
    borderWidth: e.borderWidth,
    borderColor: e.borderColor,
    padding: DBSpacing.md,
    marginVertical: DBSpacing.xs,
    shadowColor: c.shadowColor,
    shadowOffset: e.shadowOffset,
    shadowOpacity: e.shadowOpacity,
    shadowRadius: e.shadowRadius,
    elevation: e.elevation,
    ...sizeStyle,
  };

  if (props.onClick || (props as any).behavior === "interactive") {
    return (
      <Pressable
        style={({ pressed }) => [cardStyle, (props as any).style, pressed && { opacity: 0.92 }]}
        onPress={props.onClick as any}
        accessibilityRole="button"
      >
        {props.children}
      </Pressable>
    );
  }
  return <View style={[cardStyle, (props as any).style]}>{props.children}</View>;
}

export default DBCard;
