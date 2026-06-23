import React, { forwardRef } from "react";
import { Pressable, Text, View } from "react-native";
import DBText from "../text/text";
import * as Linking from "expo-linking";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBTypography, DBColors } from "../../shared/tokens";
import { DBLinkProps } from "./model";

function MIIcon({ name, size, color, style }: { name: string; size: number; color: string; style?: any }) {
  const _mi = require("@expo/vector-icons/MaterialIcons");
  const MaterialIcons = _mi.default ?? _mi;
  // @expo/vector-icons MaterialIcons uses hyphenated names (e.g. arrow-forward, open-in-new)
  const normalizedName = name.replace(/_/g, "-");
  return <MaterialIcons name={normalizedName} size={size} color={color} style={style} accessibilityElementsHidden />;
}

function DBLinkFn(props: DBLinkProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;

  const variant = (props as any).variant ?? ""; // empty = default blue
  const size = (props as any).size ?? "medium";
  // content: "inline" | "internal" | "external"
  // "inline" = no arrow, renders as Text (sits inside parent Text)
  // "internal" = arrow_forward (default), "external" = open_in_new
  const content = (props as any).content ?? "internal";
  const leadingIcon = (props as any).icon as string | undefined;
  const isInline = content === "inline";
  const isSmall = size === "small";
  const isDisabled = Boolean(props.disabled);

  // default (no variant) = informational blue
  // adaptive = text color (black in light, white in dark)
  // brand = DB red
  const blueColor = isDark ? DBColors.informational.light : DBColors.informational.origin;
  const linkColor = variant === "brand"
    ? c.brandText
    : variant === "adaptive"
      ? c.text
      : blueColor;
  const activeColor = isDisabled ? c.textDisabled : linkColor;

  // trailing navigation arrow (only for non-inline)
  const trailingIconName = content === "external" ? "open_in_new" : "arrow_forward";

  async function handlePress() {
    if (props.href) {
      const canOpen = await Linking.canOpenURL(props.href);
      if (canOpen) await Linking.openURL(props.href);
    }
    if (props.onClick) (props.onClick as any)();
  }

  // Inline content: bare Text — sits naturally inside a parent Text, inherits font size
  if (isInline) {
    return (
      <Text
        onPress={isDisabled ? undefined : handlePress}
        accessibilityRole="link"
        style={{ color: activeColor, textDecorationLine: isDisabled ? "none" : "underline" }}
      >
        {props.text ?? props.children}
      </Text>
    );
  }

  // Block: [leading icon?] Label [trailing arrow]
  const fontSize = isSmall ? DBTypography.sizeSM : DBTypography.sizeMD;
  const iconSize = isSmall ? 14 : 16;

  return (
    <Pressable
      ref={component}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="link"
      accessibilityLabel={props.text ?? String(props.children ?? "")}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 4 }, pressed && { opacity: 0.7 }]}
    >
      {leadingIcon && (
        <MIIcon name={leadingIcon} size={iconSize} color={activeColor} />
      )}
      <DBText style={[
        { color: activeColor, textDecorationLine: "underline", fontSize },
        isDisabled && { textDecorationLine: "none" },
      ]}>
        {props.text ?? props.children}
      </DBText>
      <MIIcon name={trailingIconName} size={iconSize} color={activeColor} style={{ marginLeft: -2 }} />
    </Pressable>
  );
}

const DBLink = forwardRef<View, DBLinkProps>(DBLinkFn);
export default DBLink;
