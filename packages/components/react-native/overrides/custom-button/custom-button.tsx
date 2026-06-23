import React, { forwardRef } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import DBText from "../text/text";
import { DBCustomButtonProps } from "./model";

function DBCustomButtonFn(props: DBCustomButtonProps, component: any) {
  function handlePress(event: any) {
    if ((props as any).onClick) (props as any).onClick(event);
  }

  return (
    <Pressable
      ref={component}
      onPress={handlePress}
      disabled={Boolean((props as any).disabled)}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      {props.children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4
  },
  pressed: { opacity: 0.7 }
});

const DBCustomButton = forwardRef<View, DBCustomButtonProps>(DBCustomButtonFn);
export default DBCustomButton;
