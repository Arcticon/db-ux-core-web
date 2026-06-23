import React from "react";
import { View, StyleSheet } from "react-native";
import DBText from "../text/text";
import type { DBTabPanelProps } from "./model";

function DBTabPanel(props: DBTabPanelProps) {
  return (
    <View style={styles.panel} accessibilityRole="summary">
      {props.content ?? props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 16 },
});

export default DBTabPanel;
