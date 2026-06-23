import React from "react";
import { View, StyleSheet } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBBorderRadius } from "../../shared/tokens";
import type { DBCustomSelectDropdownProps } from "./model";

function DBCustomSelectDropdown(props: DBCustomSelectDropdownProps) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  return (
    <View
      style={[
        styles.dropdown,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          shadowColor: c.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 5,
        },
      ]}
    >
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: "100%" as any,
    left: 0,
    right: 0,
    borderRadius: DBBorderRadius.sm,
    borderWidth: 1,
    zIndex: 1000,
  },
});

export default DBCustomSelectDropdown;
