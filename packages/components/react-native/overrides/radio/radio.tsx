import React, { forwardRef } from "react";
import { View, Pressable } from "react-native";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBTypography, DBSpacing } from "../../shared/tokens";
import { type DBRadioProps } from "./model";

function DBRadioFn(props: DBRadioProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;

  const styles = mkStyles(c);
  const checked = Boolean(props.checked);
  const disabled = Boolean(props.disabled);

  return (
    <View style={styles.container} ref={component}>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
        onPress={(event) => props.onChange?.(event, props.value)}
        disabled={disabled}
        accessibilityRole="radio"
        accessibilityState={{ checked, disabled }}
      >
        <View style={[styles.wrap, disabled && styles.wrapDisabled]}>
          {checked && <View style={styles.inner} />}
        </View>
        {(props.label || props.children) && (
          <DBText style={[styles.label, disabled && styles.labelDisabled]}>
            {props.label ?? props.children}
          </DBText>
        )}
      </Pressable>
    </View>
  );
}

function mkStyles(c: typeof DBTheme.light) {
  return {
    container: { marginVertical: DBSpacing.xs },
    row: { flexDirection: "row" as const, alignItems: "center" as const, gap: DBSpacing.sm },
    // Ring 20dp, border 2dp → content area 16dp. Dot 8dp → offset (16-8)/2 = 4dp.
    // 4dp × any common density (0.75/1/1.5/2/3/4) always yields an integer pixel count.
    // A 10dp dot gives 3dp offset = 4.5px at 1.5× → non-integer → visual misalignment.
    wrap: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: c.borderStrong, justifyContent: "center" as const, alignItems: "center" as const },
    wrapDisabled: { borderColor: c.textDisabled },
    inner: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.brandPrimary },
    label: { fontSize: DBTypography.sizeSM, color: c.text, flex: 1 },
    labelDisabled: { color: c.textDisabled },
  };
}

const DBRadio = forwardRef<View, DBRadioProps>(DBRadioFn);
export default DBRadio;
