import React, { useRef, useEffect } from "react";
import { Animated, PanResponder, Pressable, StyleSheet, View } from "react-native";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";
import type { DBIconToggleProps } from "./model";

type MaterialIconsType = React.ComponentType<{
  name: string;
  size: number;
  color?: string;
  accessibilityElementsHidden?: boolean;
}>;

const ITEM_W = 36;
const ITEM_H = 32;
const PAD = 3;

function DBIconToggle({ options, value, onChange }: DBIconToggleProps) {
  const { isDark } = useDBFont();
  const colors = isDark ? DBTheme.dark : DBTheme.light;
  const count = options.length;

  const selectedIdx = Math.max(0, options.findIndex((o) => o.value === value));
  const currentIdx = useRef(selectedIdx);
  const dragStartX = useRef(PAD + selectedIdx * ITEM_W);

  // Always-current refs so PanResponder (created once) never uses stale closures
  const onChangeRef = useRef(onChange);
  const optionsRef  = useRef(options);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { optionsRef.current  = options;  }, [options]);

  const anim = useRef(new Animated.Value(PAD + selectedIdx * ITEM_W)).current;

  useEffect(() => {
    currentIdx.current = selectedIdx;
  }, [selectedIdx]);

  useEffect(() => {
    Animated.spring(anim, {
      toValue: PAD + selectedIdx * ITEM_W,
      useNativeDriver: false,
      tension: 280,
      friction: 24,
    }).start();
  }, [selectedIdx]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      // Capture horizontal drags even if a child Pressable already holds the touch
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 3,
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 3,
      onPanResponderGrant: (_, g) => {
        // g.dx may already be non-zero (captured mid-move), compensate so pill starts at rest position
        dragStartX.current = PAD + currentIdx.current * ITEM_W - g.dx;
        anim.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        const cnt = optionsRef.current.length;
        const newX = Math.max(PAD, Math.min(PAD + (cnt - 1) * ITEM_W, dragStartX.current + g.dx));
        anim.setValue(newX);
      },
      onPanResponderRelease: (_, g) => {
        const cnt = optionsRef.current.length;
        const rawX = dragStartX.current + g.dx - PAD;
        const nearestIdx = Math.max(0, Math.min(cnt - 1, Math.round(rawX / ITEM_W)));
        Animated.spring(anim, {
          toValue: PAD + nearestIdx * ITEM_W,
          useNativeDriver: false,
          tension: 280,
          friction: 24,
        }).start();
        if (nearestIdx !== currentIdx.current) {
          onChangeRef.current(optionsRef.current[nearestIdx].value);
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(anim, {
          toValue: PAD + currentIdx.current * ITEM_W,
          useNativeDriver: false,
          tension: 280,
          friction: 24,
        }).start();
      },
    })
  ).current;

  const totalW = count * ITEM_W + PAD * 2;
  const pillH = ITEM_H + PAD * 2;

  // Lazy require — same pattern as DBIcon to avoid PlatformConstants crash on startup
  const _mi = require("@expo/vector-icons/MaterialIcons");
  const MaterialIcons: MaterialIconsType = _mi.default ?? _mi;

  return (
    <View
      style={[styles.track, {
        width: totalW,
        height: pillH,
        borderRadius: pillH / 2,
        backgroundColor: colors.bgSurface,
      }]}
      {...panResponder.panHandlers}
      accessibilityRole="radiogroup"
    >
      {/* Sliding pill */}
      <Animated.View
        style={[styles.pill, {
          width: ITEM_W,
          height: ITEM_H,
          borderRadius: ITEM_H / 2,
          backgroundColor: colors.bg,
          top: PAD,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.3 : 0.12,
          shadowRadius: 3,
          elevation: 3,
          transform: [{ translateX: anim }],
        }]}
      />

      {/* Icon options (above pill) */}
      <View style={[styles.optionRow, { paddingHorizontal: PAD, paddingVertical: PAD }]}>
        {options.map((opt, i) => {
          const isActive = i === selectedIdx;
          const iconName = (opt.icon as string)?.replace(/_/g, "-");
          return (
            <Pressable
              key={opt.value}
              style={[styles.option, { width: ITEM_W, height: ITEM_H }]}
              onPress={() => { if (!isActive) onChange(opt.value); }}
              accessibilityLabel={opt.label ?? opt.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
            >
              <MaterialIcons
                name={iconName}
                size={18}
                color={isActive ? colors.brandText : colors.textMuted}
                accessibilityElementsHidden
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    position: "relative",
    overflow: "hidden",
  },
  pill: {
    position: "absolute",
    left: 0,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1,
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default DBIconToggle;
