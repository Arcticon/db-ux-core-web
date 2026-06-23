import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";
import type { DBTabListProps } from "./model";

function DBTabList(props: DBTabListProps) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const isFull = (props as any).width === "full";
  const alignment: "start" | "center" = (props as any).alignment ?? "start";
  const [listWidth, setListWidth] = useState(0);

  const children = React.Children.map(props.children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child as React.ReactElement<any>, { _full: isFull, _alignment: alignment })
      : child
  );

  return (
    <View
      style={[styles.container, { borderBottomColor: c.border }]}
      onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}
    >
      {isFull ? (
        <View style={styles.fullRow}>{children}</View>
      ) : (
        <ScrollView
          horizontal
          scrollEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.content}
          style={listWidth > 0 ? { width: listWidth } : styles.scrollFallback}
        >
          {children}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: StyleSheet.hairlineWidth, alignSelf: "stretch" },
  scrollFallback: { flexShrink: 1 },
  content: { flexDirection: "row", alignItems: "center" },
  fullRow: { flexDirection: "row" },
});

export default DBTabList;
