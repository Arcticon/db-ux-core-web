import React, { forwardRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBBorderRadius } from "../../shared/tokens";
import { DBPopoverProps } from "./model";

function mkStyles(c: typeof DBTheme.light) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
    centeredWrap: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
    panel: {
      backgroundColor: c.bg,
      borderRadius: DBBorderRadius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: 16,
      width: "100%",
      maxWidth: 360,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 10,
    },
  });
}

function DBPopoverFn(props: DBPopoverProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const [visible, setVisible] = useState(Boolean(props.open));

  useEffect(() => { setVisible(Boolean(props.open)); }, [props.open]);

  function handleClose() {
    setVisible(false);
    (props as any).onClose?.();
  }

  const styles = mkStyles(c);

  return (
    <View ref={component}>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        {/* Tap outside the panel to dismiss — no dark tint */}
        <Pressable style={styles.backdrop} onPress={handleClose}>
          <View style={styles.centeredWrap}>
            <Pressable onPress={() => {/* absorb taps inside panel */}}>
              <View style={styles.panel}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {props.children}
                </ScrollView>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const DBPopover = forwardRef<View, DBPopoverProps>(DBPopoverFn);
export default DBPopover;
