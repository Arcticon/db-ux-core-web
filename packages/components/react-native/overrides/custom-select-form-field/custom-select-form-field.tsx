import React from "react";
import { View, StyleSheet } from "react-native";
import DBText from "../text/text";
import type { DBCustomSelectFormFieldProps } from "./model";

function DBCustomSelectFormField(props: DBCustomSelectFormFieldProps) {
  return <View style={styles.formField}>{props.children}</View>;
}

const styles = StyleSheet.create({
  formField: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
});

export default DBCustomSelectFormField;
