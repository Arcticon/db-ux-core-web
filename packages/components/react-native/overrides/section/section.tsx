import React, { createContext } from "react";
import { View, useWindowDimensions } from "react-native";
import { useDBFont } from "../../providers/font-provider";
import type { DBSectionProps } from "./model";

export const DBSectionContext = createContext<{ cardWidth?: number; isFull: boolean }>({ isFull: false });

const SPACING_PAD: Record<string, number> = {
  none: 0, small: 16, medium: 32, large: 48,
};

const DENSITY_GAP: Record<string, number> = {
  functional: 8, regular: 16, expressive: 24,
};

// fraction of screenWidth for the section itself
const SECTION_SCALE: Record<string, number> = {
  small: 0.45, medium: 0.65, large: 0.85,
};

function DBSection(props: DBSectionProps) {
  const { isDark } = useDBFont();
  const { width: screenW } = useWindowDimensions();
  const sectionBg = isDark ? "#062736" : "#ebf5fe";
  const spacing: string = (props as any).spacing ?? "none";
  const density: string = (props as any).density ?? "regular";
  const widthKey: string = (props as any).width ?? "full";
  const isFull = widthKey === "full";

  const pad = SPACING_PAD[spacing] ?? 0;
  const gap = DENSITY_GAP[density] ?? 16;

  // Section width
  const sectionW: number | "100%" = isFull
    ? "100%"
    : Math.round(screenW * (SECTION_SCALE[widthKey] ?? 0.65));

  // Always exactly 2 cards per row
  const innerW = typeof sectionW === "number" ? sectionW : screenW;
  const cardWidth = Math.floor((innerW - 2 * pad - gap) / 2);

  return (
    <DBSectionContext.Provider value={{ cardWidth, isFull }}>
      <View
        style={[
          { padding: pad, backgroundColor: sectionBg, width: sectionW },
          (props as any).style,
        ]}
      >
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
          {props.children}
        </View>
      </View>
    </DBSectionContext.Provider>
  );
}

export default DBSection;
