import React, { forwardRef, useState, useRef } from "react";
import {
  Dimensions,
  Modal,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";
import { DBTooltipProps } from "./model";

type Placement = "top" | "bottom" | "left" | "right";

const TIP_W = 220;

function extractText(node: any): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node) return "";
  if (Array.isArray(node)) return node.map(extractText).join(" ").trim();
  if (node.props?.children !== undefined) return extractText(node.props.children);
  return "";
}

function DBTooltipFn(props: DBTooltipProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<View>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, w: 0, h: 0 });
  // Actual measured tooltip height — starts at 0 so first layout fires reposition
  const [tipH, setTipH] = useState(0);

  const childArray = React.Children.toArray(props.children);
  const trigger = childArray[0];

  const rawContent: string =
    (props as any).tooltipText ??
    (props as any).content ??
    (props as any).text ??
    (childArray[1] ? extractText(childArray[1]) : "");

  function show() {
    if (!rawContent) return;
    triggerRef.current
      ? (triggerRef.current as any).measureInWindow((x: number, y: number, w: number, h: number) => {
          setPos({ x, y, w, h });
          setVisible(true);
        })
      : setVisible(true);
  }

  // Strategy A: inject onPress/onClick for interactive children (DBButton etc.)
  const triggerWithHandler = React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement<any>, {
        onPress: (e: any) => {
          (trigger as React.ReactElement<any>).props?.onPress?.(e);
          (trigger as React.ReactElement<any>).props?.onClick?.(e);
          show();
        },
        onClick: (e: any) => {
          (trigger as React.ReactElement<any>).props?.onClick?.(e);
          show();
        },
      })
    : trigger;

  const placement: Placement = ((props as any).placement ?? "bottom") as Placement;
  const { width: winW } = Dimensions.get("window");
  const GAP = 6;

  function positionStyle(measuredH: number) {
    const h = measuredH || 36; // sensible fallback before first layout
    const { x, y, w } = pos;
    const cx = x + w / 2;
    const left = Math.max(8, Math.min(cx - TIP_W / 2, winW - TIP_W - 8));
    switch (placement) {
      case "top":
        return { top: Math.max(8, pos.y - h - GAP), left };
      case "left":
        return { top: Math.max(8, pos.y + pos.h / 2 - h / 2), right: winW - x + GAP, maxWidth: TIP_W };
      case "right":
        return { top: Math.max(8, pos.y + pos.h / 2 - h / 2), left: x + w + GAP, maxWidth: TIP_W };
      default:
        return { top: pos.y + pos.h + GAP, left };
    }
  }

  return (
    <View style={styles.container} ref={component}>
      {/* Strategy B: outer Pressable for non-interactive children (DBBadge etc.) */}
      <Pressable onPress={show}>
        <View ref={triggerRef} pointerEvents="box-none">
          {triggerWithHandler}
        </View>
      </Pressable>
      {rawContent ? (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setVisible(false)}>
            <View
              style={[styles.tooltip, { backgroundColor: c.text, shadowColor: "#000" }, positionStyle(tipH)]}
              onLayout={(e) => setTipH(e.nativeEvent.layout.height)}
              pointerEvents="none"
            >
              <DBText style={[styles.tooltipText, { color: c.bg }]}>{rawContent}</DBText>
            </View>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "flex-start" },
  tooltip: {
    position: "absolute",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: TIP_W,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  tooltipText: { fontSize: 13, lineHeight: 18 },
});

const DBTooltip = forwardRef<View, DBTooltipProps>(DBTooltipFn);
export default DBTooltip;
