import React from "react";
import { View, StyleSheet } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";
import type { DBDividerProps } from "./model";

function DBDivider(props: DBDividerProps) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const isVertical = props.variant === "vertical";
  return (
    <View
      style={[
        { backgroundColor: c.border },
        isVertical ? styles.vertical : styles.horizontal,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: { height: 1, alignSelf: "stretch", marginVertical: 8 },
  vertical: { width: 1, alignSelf: "stretch", marginHorizontal: 8 },
});

export default DBDivider;
