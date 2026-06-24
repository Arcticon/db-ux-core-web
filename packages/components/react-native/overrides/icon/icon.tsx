import React, { forwardRef } from "react";
import { View, StyleSheet } from "react-native";
import DBText from "../text/text";
import { DBIconProps, UnderscoreToDash } from "./model";
import type { IconTypes } from "../../shared/model";

// Lazy type-only import so @expo/vector-icons is NOT required at module load time.
// A top-level static import triggers Platform → TurboModuleRegistry.getEnforcing('PlatformConstants')
// before the bridgeless runtime is ready, crashing the app in Expo Go.
type MaterialIconsType = React.ComponentType<{ name: string; size: number; style?: any; accessibilityElementsHidden?: boolean }>;

/**
 * DBIcon wraps `@expo/vector-icons` MaterialIcons.
 * The `icon` prop is passed as the icon name. Non-matching names fall back to a Text placeholder.
 * The `weight` prop maps to icon size (16/20/24/32/48/64).
 */
function DBIconFn(props: DBIconProps, component: any) {
  // Lazy require: only loaded when the component renders, after the JS runtime is ready.
  const MaterialIcons = require("@expo/vector-icons/MaterialIcons")
    .default as typeof import("@expo/vector-icons/MaterialIcons").default;

  const sizeMap: Record<string, number> = {
    "16": 16, "20": 20, "24": 24, "32": 32, "48": 48, "64": 64
  };
  const size = props.weight ? (sizeMap[props.weight] ?? 24) : 24;
  // DB UX uses underscore names (e.g. "arrow_forward"); MaterialIcons needs hyphens
  const iconName = props.icon?.replace(
    /_/g,
    '-'
  ) as UnderscoreToDash<IconTypes>;

  if (!iconName) {
    return props.text ? (
      <View ref={component}><DBText style={styles.text}>{props.text}</DBText></View>
    ) : (
      <View ref={component}>{props.children}</View>
    );
  }

  return (
    <MaterialIcons
      name={iconName}
      size={size}
      style={props.style}
      accessibilityElementsHidden
    />
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 14 }
});

const DBIcon = forwardRef<View, DBIconProps>(DBIconFn);
export default DBIcon;
