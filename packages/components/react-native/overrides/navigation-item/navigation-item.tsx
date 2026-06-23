import React, { useRef, useState } from "react";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";

export type DBNavigationItemProps = {
  label?: string;
  active?: boolean;
  disabled?: boolean | string;
  onPress?: () => void;
  subNavigation?: React.ReactNode;
  subNavigationExpanded?: boolean | string;
  children?: React.ReactNode;
};

type PanelLevel = {
  items: React.ReactElement[];
  left: number;
  top: number;
  activeIdx: number | null;
};

function flattenChildren(node: React.ReactNode): React.ReactElement[] {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(flattenChildren);
  if (!React.isValidElement(node)) return [];
  if ((node as any).type === React.Fragment) return flattenChildren((node.props as any).children);
  return [node as React.ReactElement];
}

const PANEL_W = 200;
const PANEL_GAP = 4;

function DBNavigationItem(props: DBNavigationItemProps) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const triggerRef = useRef<View>(null);
  const [visible, setVisible] = useState(false);
  const [panels, setPanels] = useState<PanelLevel[]>(() => []);

  const hasDropdown = Boolean(props.subNavigation);
  const isExpanded = props.subNavigationExpanded !== undefined
    ? Boolean(props.subNavigationExpanded)
    : visible;

  function openDropdown() {
    if (!triggerRef.current) return;
    (triggerRef.current as any).measureInWindow((x: number, y: number, _w: number, h: number) => {
      const { width: winW } = Dimensions.get("window");
      const left = Math.max(8, Math.min(x, winW - PANEL_W - 8));
      const top = y + h;
      setPanels([{ items: flattenChildren(props.subNavigation), left, top, activeIdx: null }]);
      setVisible(true);
    });
  }

  function close() {
    setVisible(false);
    setPanels([]);
  }

  function handlePress() {
    if (hasDropdown) openDropdown();
    else props.onPress?.();
  }

  function handleItemPress(depthIdx: number, itemIdx: number, item: React.ReactElement) {
    const p = item.props as any;
    const subItems = flattenChildren(p.subNavigation);
    if (subItems.length > 0) {
      // Open sub-panel to the right (or left if overflows)
      const { width: winW } = Dimensions.get("window");
      const parentPanel = panels[depthIdx];
      let subLeft = parentPanel.left + PANEL_W + PANEL_GAP;
      if (subLeft + PANEL_W > winW - 8) {
        subLeft = parentPanel.left - PANEL_W - PANEL_GAP;
      }
      const subTop = parentPanel.top;
      // Mark active in parent, drop any deeper panels, push new one
      setPanels(prev => {
        const updated = prev.slice(0, depthIdx + 1).map((panel, i) =>
          i === depthIdx ? { ...panel, activeIdx: itemIdx } : panel
        );
        updated.push({ items: subItems, left: Math.max(8, subLeft), top: subTop, activeIdx: null });
        return updated;
      });
    } else {
      close();
      p.onPress?.();
    }
  }

  return (
    <>
      <Pressable
        ref={triggerRef}
        style={({ pressed }) => [
          styles.item,
          props.active ? { borderBottomColor: c.brandPrimary } : { borderBottomColor: "transparent" },
          pressed && { backgroundColor: c.bgSurface },
          Boolean(props.disabled) && { opacity: 0.4 },
        ]}
        onPress={handlePress}
        disabled={Boolean(props.disabled)}
        accessibilityRole="menuitem"
        accessibilityState={{ selected: props.active, expanded: hasDropdown ? isExpanded : undefined }}
      >
        <View style={styles.labelRow}>
          {props.label ? (
            <DBText weight={props.active ? "bold" : "regular"} style={{ color: props.active ? c.text : c.textMuted }}>
              {props.label}
            </DBText>
          ) : props.children}
          {hasDropdown && (
            <DBText style={[styles.chevron, { color: c.textMuted }]}>{isExpanded ? " ▴" : " ▾"}</DBText>
          )}
        </View>
      </Pressable>

      {hasDropdown && (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={close} />
          {(panels || []).map((panel, depth) => (
            <View
              key={depth}
              style={[styles.panel, {
                top: panel.top,
                left: panel.left,
                width: PANEL_W,
                backgroundColor: c.bg,
                borderColor: c.border,
                shadowColor: "#000",
              }]}
            >
              {panel.items.map((item, idx) => {
                const p = item.props as any;
                const label = p.label ?? p.children ?? "";
                const hasSub = flattenChildren(p.subNavigation).length > 0;
                const isActive = panel.activeIdx === idx;
                return (
                  <Pressable
                    key={idx}
                    style={({ pressed }) => [
                      styles.row,
                      { borderBottomColor: c.border },
                      (pressed || isActive) && { backgroundColor: c.bgSurface },
                    ]}
                    onPress={() => handleItemPress(depth, idx, item)}
                  >
                    <DBText
                      weight={p.active || isActive ? "bold" : "regular"}
                      style={{ color: c.text, flex: 1 }}
                    >
                      {label}
                    </DBText>
                    {hasSub && (
                      <DBText style={{ fontSize: 14, color: c.textMuted }}>›</DBText>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  item: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 9, borderBottomWidth: 3 },
  labelRow: { flexDirection: "row", alignItems: "center" },
  chevron: { fontSize: 11 },
  panel: {
    position: "absolute",
    flexDirection: "column",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 420,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default DBNavigationItem;
