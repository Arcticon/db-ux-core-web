import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import DBText from "../text/text";
import type { DBCustomSelectListProps } from "./model";

function DBCustomSelectList(props: DBCustomSelectListProps) {
  return (
    <ScrollView style={styles.list} nestedScrollEnabled>
      {props.children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { maxHeight: 240 },
});

export default DBCustomSelectList;
