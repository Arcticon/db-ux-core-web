import React from "react";
import { View } from "react-native";
import { DBSpacing } from "../../shared/tokens";
import type { DBStackProps } from "./model";

const GAP_MAP: Record<string, number> = {
  none:   0,
  xs:     DBSpacing.xs,
  sm:     DBSpacing.sm,
  md:     DBSpacing.md,
  lg:     DBSpacing.lg,
  xl:     DBSpacing.xl,
};

const ALIGN_MAP: Record<string, "flex-start" | "flex-end" | "center" | "stretch"> = {
  start:   "flex-start",
  end:     "flex-end",
  center:  "center",
  stretch: "stretch",
};

const JUSTIFY_MAP: Record<string, "flex-start" | "flex-end" | "center" | "space-between"> = {
  start:          "flex-start",
  end:            "flex-end",
  center:         "center",
  "space-between": "space-between",
};

function DBStack(props: DBStackProps) {
  const isRow = props.direction === "row";
  const gap = GAP_MAP[(props as any).gap ?? "md"] ?? DBSpacing.md;
  const alignItems = ALIGN_MAP[props.alignment ?? (isRow ? "center" : "stretch")] ?? (isRow ? "center" : "stretch");
  const justifyContent = JUSTIFY_MAP[props.justifyContent ?? "start"] ?? "flex-start";
  const flexWrap = props.wrap ? "wrap" : "nowrap";

  return (
    <View
      style={{
        flexDirection: isRow ? "row" : "column",
        flexWrap,
        gap,
        alignItems,
        justifyContent,
      }}
    >
      {props.children}
    </View>
  );
}

export default DBStack;
