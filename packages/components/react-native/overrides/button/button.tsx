import React, { forwardRef } from "react";
import { Pressable, View } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import {
  DBTheme,
  DBTypography,
  DBSpacing,
  DBBorderRadius,
} from "../../shared/tokens";
import { DBButtonProps } from "./model";
import { DBIcon } from "../icon";

function MIIcon({ name, size, color, style }: { name: string; size: number; color: string; style?: any }) {
  const _mi = require("@expo/vector-icons/MaterialIcons");
  const MaterialIcons = _mi.default ?? _mi;
  // @expo/vector-icons MaterialIcons uses hyphenated names (e.g. arrow-forward, open-in-new)
  const normalizedName = name.replace(/_/g, "-");
  return <MaterialIcons name={normalizedName} size={size} color={color} style={style} accessibilityElementsHidden />;
}

function mkStyles(c: typeof DBTheme.light) {
  return {
    button: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingVertical: DBSpacing.sm + 2,
      paddingHorizontal: DBSpacing.lg,
      borderRadius: DBBorderRadius.sm,
      borderWidth: 1,
      borderColor: c.borderStrong,
      backgroundColor: "transparent",
    },
    filled: { backgroundColor: c.text, borderColor: c.text },
    ghost: { borderColor: "transparent" },
    brand: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
    buttonDisabled: { opacity: 0.4 },
    fullWidth: {
      flexGrow: 1,
      flexShrink: 1,
      inlineSize: "100%",
    },
    label: {
      fontSize: DBTypography.sizeSM,
      color: c.text,
      fontWeight: DBTypography.weightMedium,
    },
    labelInverted: { color: c.bg },
    labelDisabled: { color: c.textDisabled },
    showIcon: { marginInlineEnd: 4 },
    showIconTrailing: { marginInlineStart: 4 },
  };
}

function DBButtonFn(props: DBButtonProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;

  const styles = mkStyles(c);

  function handlePress(event: any) {
    if (props.onClick) (props.onClick as any)(event);
  }

  const label = props.text ?? props.children;

  const isInverted = props.variant === "filled" || props.variant === "brand";
  const isDisabled = Boolean(props.disabled);
  const iconColor = isDisabled && !isInverted
		? c.textDisabled
		: isInverted
			? c.bg
			: c.text;
  const iconSize = 18;

  const showIconTrailing = Boolean((props as any).showIconTrailing);
  const leadingIcon = (props as any).iconLeading ?? (props as any).icon;
  const showLeadingIcon =
    ((props as any).showIconLeading ?? (props as any).showIcon) !== false &&
    !showIconTrailing &&
    Boolean(leadingIcon);
  const trailingIcon = (props as any).iconTrailing ?? (props as any).icon;
  const showTrailingIcon = showIconTrailing && Boolean(trailingIcon);


	return (
    <Pressable
      ref={component}
      onPress={handlePress}
      disabled={Boolean(props.disabled)}
      accessibilityRole="button"
      accessibilityLabel={typeof label === "string" ? label : undefined}
      accessibilityState={{ disabled: Boolean(props.disabled) }}
      style={({ pressed }) => [
        styles.button,
        props.variant === "filled" && styles.filled,
        props.variant === "ghost" && styles.ghost,
        props.variant === "brand" && styles.brand,
        Boolean(props.disabled) && styles.buttonDisabled,
        props.width === "full" && styles.fullWidth,
        pressed && !Boolean(props.disabled) && { opacity: 0.75 },
      ]}
    >
		{showLeadingIcon && (
			<MIIcon name={leadingIcon} size={iconSize} color={iconColor} style={label ? { marginRight: DBSpacing.sm } : undefined} />
		)}
      {typeof label === "string" ? (
        <DBText
          style={[
            styles.label,
            (props.variant === "filled" || props.variant === "brand") && styles.labelInverted,
            Boolean(props.disabled) && !(props.variant === "filled" || props.variant === "brand") && styles.labelDisabled,
          ]}
        >
          {label}
        </DBText>
      ) : (
        label
      )}
      {showTrailingIcon && (
        <MIIcon name={trailingIcon} size={iconSize} color={iconColor} style={label ? { marginLeft: DBSpacing.sm } : undefined} />
      )}
    </Pressable>
  );
}

const DBButton = forwardRef<View, DBButtonProps>(DBButtonFn);
export default DBButton;
