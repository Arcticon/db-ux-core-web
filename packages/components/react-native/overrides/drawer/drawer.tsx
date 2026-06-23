import React, { forwardRef, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";
import { DBDrawerProps } from "./model";

const DURATION = 260;
const DRAWER_SIZE = Math.min(Math.round(Dimensions.get("window").width * 0.82), 480);
const OFF = 800; // guaranteed off-screen offset

function DBDrawerFn(props: DBDrawerProps, component: any) {
  const { isDark } = useDBFont();
  const c = isDark ? DBTheme.dark : DBTheme.light;
  const direction = props.direction ?? "left";
  const isOpen = Boolean(props.open);
  const isVertical = direction === "up" || direction === "down";

  const offset =
    direction === "right" ?  DRAWER_SIZE :
    direction === "down"  ?  OFF :
    direction === "up"    ? -OFF :
    -DRAWER_SIZE;

  const anim = useRef(new Animated.Value(isOpen ? 0 : offset)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isOpen ? 0 : offset,
      duration: DURATION,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const transform = isVertical ? [{ translateY: anim }] : [{ translateX: anim }];

  // Panel anchored absolutely to its edge; fills the full cross-axis
  const panelPos =
    direction === "right" ? { right: 0, top: 0, bottom: 0, width: DRAWER_SIZE } :
    direction === "down"  ? { left: 0, right: 0, bottom: 0, maxHeight: "60%" as any } :
    direction === "up"    ? { left: 0, right: 0, top: 0, maxHeight: "60%" as any } :
    /* left */              { left: 0, top: 0, bottom: 0, width: DRAWER_SIZE };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="none"
      onRequestClose={() => props.onClose?.()}
    >
      {/* Dimmed backdrop — rendered first (behind panel) */}
      <Pressable
        style={[StyleSheet.absoluteFill, styles.backdrop]}
        onPress={() => props.backdrop !== "none" && props.onClose?.()}
      />

      {/* Drawer panel — rendered second (on top of backdrop) */}
      <Animated.View
        ref={component}
        style={[
          { position: "absolute" },
          panelPos,
          {
            backgroundColor: c.bgElevated,
            shadowColor: c.shadowColor,
            shadowOffset: {
              width:  direction === "right" ? -2 : (isVertical ? 0 : 2),
              height: direction === "down"  ? -2 : (direction === "up" ? 2 : 0),
            },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          },
          { transform },
        ]}
      >
        <View style={[styles.drawerHeader, { borderBottomColor: c.border }]}>
          <Pressable
            onPress={() => props.onClose?.()}
            accessibilityLabel={props.closeButtonText ?? "Close"}
            accessibilityRole="button"
            style={({ pressed }) => [pressed && { opacity: 0.7 }]}
          >
            <DBText style={[styles.closeBtn, { color: c.text }]}>✕</DBText>
          </Pressable>
        </View>
        <ScrollView style={styles.content}>{props.children}</ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0,0,0,0.45)" },
  drawerHeader: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: { fontSize: 20 },
  content: { flex: 1, padding: 16 },
});

const DBDrawer = forwardRef<View, DBDrawerProps>(DBDrawerFn);
export default DBDrawer;
