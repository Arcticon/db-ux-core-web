import React from "react";
import { Platform, Text } from "react-native";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBTypography } from "../../shared/tokens";
import type { DBTextProps } from "./model";

const VARIANT_COLOR: Record<NonNullable<DBTextProps["variant"]>, keyof typeof DBTheme.light> = {
  body:     "text",
  heading:  "text",
  label:    "textMuted",
  subtle:   "textSubtle",
  caption:  "textSubtle",
  overline: "textSubtle",
  brand:    "brandText",
  disabled: "textDisabled",
};

const VARIANT_SIZE: Record<NonNullable<DBTextProps["variant"]>, number> = {
  body:     DBTypography.sizeMD,
  heading:  DBTypography.sizeLG,
  label:    DBTypography.sizeSM,
  subtle:   DBTypography.sizeSM,
  caption:  DBTypography.size2XS,
  overline: DBTypography.size2XS,
  brand:    DBTypography.sizeMD,
  disabled: DBTypography.sizeMD,
};

const VARIANT_WEIGHT: Record<NonNullable<DBTextProps["variant"]>, string> = {
  body:     DBTypography.weightRegular,
  heading:  DBTypography.weightBold,
  label:    DBTypography.weightMedium,
  subtle:   DBTypography.weightRegular,
  caption:  DBTypography.weightRegular,
  overline: DBTypography.weightMedium,
  brand:    DBTypography.weightBold,
  disabled: DBTypography.weightRegular,
};

const SIZE_MAP: Record<NonNullable<DBTextProps["size"]>, number> = {
  xs: DBTypography.size2XS,
  sm: DBTypography.sizeSM,
  md: DBTypography.sizeMD,
  lg: DBTypography.sizeLG,
  xl: DBTypography.sizeXL,
};

const WEIGHT_MAP: Record<NonNullable<DBTextProps["weight"]>, string> = {
  regular: DBTypography.weightRegular,
  medium:  DBTypography.weightMedium,
  bold:    DBTypography.weightBold,
};

function DBText(props: DBTextProps) {
  const { isDark, fontFamily: f } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const variant = props.variant ?? "body";

  const colorKey = VARIANT_COLOR[variant];
  const fontSize = props.size ? SIZE_MAP[props.size] : VARIANT_SIZE[variant];
  const fontWeightStr = props.weight ? WEIGHT_MAP[props.weight] : VARIANT_WEIGHT[variant];
  const weightKey = (props.weight ?? (fontWeightStr === DBTypography.weightBold ? "bold" : fontWeightStr === DBTypography.weightMedium ? "medium" : "regular")) as NonNullable<DBTextProps["weight"]>;

  const letterSpacing = variant === "overline" ? 0.8 : undefined;
  const textTransform = variant === "overline" ? "uppercase" as const : undefined;

  const { variant: _v, size: _s, weight: _w, style, children, ...rest } = props;

  return (
    <Text
      style={[
        {
          color: c[colorKey],
          fontSize,
          ...(Platform.OS === 'android' && f[weightKey] ? {} : { fontWeight: fontWeightStr as any }),
          fontFamily: f[weightKey],
          ...(letterSpacing !== undefined ? { letterSpacing } : {}),
          ...(textTransform !== undefined ? { textTransform } : {}),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

export default DBText;
