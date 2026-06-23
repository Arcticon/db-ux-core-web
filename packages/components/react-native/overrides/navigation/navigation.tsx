import React from "react";
import { View, ScrollView } from "react-native";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";

export type DBNavigationExtraProps = {
  children?: React.ReactNode;
  style?: any;
  direction?: "horizontal" | "vertical";
};

function DBNavigation(props: DBNavigationExtraProps) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const isVertical = props.direction === "vertical";

  const containerStyle = {
    backgroundColor: c.bg,
    borderBottomWidth: isVertical ? 0 : 1,
    borderBottomColor: c.border,
    borderRightWidth: isVertical ? 1 : 0,
    borderRightColor: c.border,
  };

  if (isVertical) {
    return (
      <View style={[containerStyle, { paddingVertical: 4 }, props.style]}>
        {props.children}
      </View>
    );
  }

  return (
    <View style={[containerStyle, props.style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {props.children}
      </ScrollView>
    </View>
  );
}

export default DBNavigation;
