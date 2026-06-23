import React, { forwardRef, useState, useId } from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";
import { DBSimpleTabProps, DBTabsProps } from "./model";

function mkStyles(c: typeof DBTheme.light) {
  return {
    container: { flex: 1 },
    tabBarH: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    tabBarV: { flexDirection: "column" as const, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: c.border },
    tabBarHRow: { flexDirection: "row" as const },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabFull: { flex: 1 },
    tabActive: { borderBottomColor: c.brandPrimary },
    tabText: { fontSize: 14, color: c.textMuted },
    tabTextActive: { color: c.text, fontWeight: "600" as const },
    tabTextCenter: { textAlign: "center" as const },
    panel: { flex: 1, padding: 12 },
  };
}

function DBTabsFn(props: DBTabsProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const uuid = useId();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const tabs: DBSimpleTabProps[] = (() => {
    try {
      if (typeof props.tabs === "string") return JSON.parse(props.tabs);
      return (props.tabs as DBSimpleTabProps[]) ?? [];
    } catch { return []; }
  })();

  const isHorizontal = !props.orientation || props.orientation === "horizontal";
  const isFull = (props as any).width === "full";
  const alignment: "start" | "center" = (props as any).alignment ?? "start";

  function handleTabPress(index: number) {
    setSelectedIndex(index);
    if (props.onIndexChange) props.onIndexChange(index);
    if (props.onTabSelect) (props.onTabSelect as any)(index);
  }

  const styles = mkStyles(c);

  const tabItems = tabs.map((tab, index) => (
    <Pressable
      key={String(props.name ?? uuid) + index}
      style={({ pressed }) => [
        styles.tab,
        isFull && styles.tabFull,
        selectedIndex === index && styles.tabActive,
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => handleTabPress(index)}
      accessibilityRole="tab"
      accessibilityState={{ selected: selectedIndex === index }}
    >
      <DBText style={[
        styles.tabText,
        selectedIndex === index && styles.tabTextActive,
        alignment === "center" && styles.tabTextCenter,
      ]}>
        {tab.label}
      </DBText>
    </Pressable>
  ));

  return (
    <View style={styles.container} ref={component}>
      <View style={styles.tabBarH}>
        {isFull ? (
          <View style={styles.tabBarHRow}>
            {tabItems}
            {props.children}
          </View>
        ) : (
          <ScrollView
            horizontal={isHorizontal}
            contentContainerStyle={isHorizontal ? styles.tabBarHRow : undefined}
            style={!isHorizontal ? styles.tabBarV : undefined}
            showsHorizontalScrollIndicator={false}
          >
            {tabItems}
            {props.children}
          </ScrollView>
        )}
      </View>
      {tabs[selectedIndex] && (
        <View style={styles.panel}>
          {tabs[selectedIndex].content
            ? <DBText>{tabs[selectedIndex].content}</DBText>
            : tabs[selectedIndex].children}
        </View>
      )}
    </View>
  );
}

const DBTabs = forwardRef<View, DBTabsProps>(DBTabsFn);
export default DBTabs;
