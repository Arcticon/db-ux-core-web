import React, { forwardRef, useState, useEffect, useRef } from "react";
import { View, Pressable, Animated, StyleSheet } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";
import { DBAccordionItemProps } from "./model";

function mkStyles(c: typeof DBTheme.light) {
  return {
    container: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    headerPressed: { backgroundColor: c.bgSurface },
    title: { fontSize: 16, fontWeight: "600" as const, flex: 1, color: c.text },
    chevron: { fontSize: 12, color: c.textMuted },
    body: { overflow: "hidden" as const },
    bodyInner: { paddingHorizontal: 16, paddingBottom: 14 },
    bodyText: { fontSize: 13, color: c.textMuted },
  };
}

function DBAccordionItemFn(props: DBAccordionItemProps & {
  onToggle?: () => void;
}, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const [open, setOpen] = useState(Boolean((props as any).open ?? props.defaultOpen));
  const anim = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    const next = Boolean((props as any).open);
    setOpen(next);
    Animated.timing(anim, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [(props as any).open]);

  function handlePress() {
    const next = !open;
    setOpen(next);
    Animated.timing(anim, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
    if (props.onToggle) props.onToggle();
    if ((props as any).onOpen && next) (props as any).onOpen();
    if ((props as any).onClose && !next) (props as any).onClose();
  }

  const maxHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 2000] });
  const styles = mkStyles(c);

  return (
    <View style={styles.container} ref={component}>
      <Pressable
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <DBText style={styles.title}>{props.headlinePlain ?? props.text}</DBText>
        <DBText style={styles.chevron}>{open ? "▴" : "▾"}</DBText>
      </Pressable>
      <Animated.View style={[styles.body, { maxHeight, opacity: anim }]}>
        <View style={styles.bodyInner}>
          {(props as any).content
            ? <DBText style={styles.bodyText}>{(props as any).content}</DBText>
            : props.children}
        </View>
      </Animated.View>
    </View>
  );
}

const DBAccordionItem = forwardRef<View, DBAccordionItemProps & { open?: boolean; onOpen?: () => void; onClose?: () => void; onToggle?: () => void }>(DBAccordionItemFn);
export default DBAccordionItem;
