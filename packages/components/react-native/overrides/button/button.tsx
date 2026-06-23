import React, { forwardRef } from "react";
import { Pressable, View } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBTypography, DBSpacing, DBBorderRadius } from "../../shared/tokens";
import { DBButtonProps } from "./model";

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
    fullWidth: { width: "100%" as const },
    label: { fontSize: DBTypography.sizeSM, color: c.text, fontWeight: DBTypography.weightMedium },
    labelInverted: { color: c.bg },
    labelDisabled: { color: c.textDisabled },
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
    </Pressable>
  );
}

const DBButton = forwardRef<View, DBButtonProps>(DBButtonFn);
export default DBButton;
