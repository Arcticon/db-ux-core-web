import React, { forwardRef, useState } from "react";
import { View, Pressable } from "react-native";
import DBText from "../text/text";
import DBInfotext from "../infotext/infotext";
import { DEFAULT_VALID_MESSAGE } from "../../shared/constants";
import { stringPropVisible } from "../../utils";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBTypography, DBSpacing, DBBorderRadius } from "../../shared/tokens";
import { DBCheckboxProps } from "./model";

type MaterialIconsType = React.ComponentType<{ name: string; size: number; color?: string; accessibilityElementsHidden?: boolean }>;

function mkStyles(c: typeof DBTheme.light) {
  return {
    container: { marginVertical: DBSpacing.xs },
    row: { flexDirection: "row" as const, alignItems: "center" as const, gap: DBSpacing.sm },
    box: { width: 20, height: 20, borderWidth: 2, borderColor: c.borderStrong, borderRadius: DBBorderRadius.sm - 1, alignItems: "center" as const, justifyContent: "center" as const },
    boxChecked: { backgroundColor: c.text, borderWidth: 0 },
    boxIndeterminate: { backgroundColor: c.text, borderWidth: 0 },
    boxDisabled: { borderColor: c.textDisabled, backgroundColor: c.bgSurface },
    label: { fontSize: DBTypography.sizeSM, color: c.text, flex: 1 },
    labelDisabled: { color: c.textDisabled },
  };
}

function DBCheckboxFn(props: DBCheckboxProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;

  const styles = mkStyles(c);
  const [internal, setInternal] = useState(Boolean((props as any).defaultChecked));
  const checked = props.checked !== undefined ? Boolean(props.checked) : internal;
  const indeterminate = Boolean((props as any).indeterminate);

  // Lazy require — avoids PlatformConstants crash on startup
  const _mi = require("@expo/vector-icons/MaterialIcons");
  const MaterialIcons: MaterialIconsType = _mi.default ?? _mi;

  function handlePress() {
    if (Boolean(props.disabled)) return;
    const next = !checked;
    setInternal(next);
    if (props.onChange) (props.onChange as any)({ target: { checked: next, value: next ? "on" : "off" } });
  }

  return (
    <View style={styles.container} ref={component}>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.75 }]}
        onPress={handlePress}
        disabled={Boolean(props.disabled)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled: Boolean(props.disabled) }}
      >
        <View style={[styles.box, checked && styles.boxChecked, indeterminate && styles.boxIndeterminate, Boolean(props.disabled) && styles.boxDisabled]}>
          {checked && (
            <MaterialIcons name="check" size={14} color={c.bg} accessibilityElementsHidden />
          )}
          {!checked && indeterminate && (
            <MaterialIcons name="remove" size={14} color={c.bg} accessibilityElementsHidden />
          )}
        </View>
        {(props.label || props.children) && (
          <DBText style={[styles.label, Boolean(props.disabled) && styles.labelDisabled]}>
            {props.label ?? props.children}
          </DBText>
        )}
      </Pressable>
      {stringPropVisible(props.message, props.showMessage) && (
        <DBInfotext size="small" semantic="adaptive">{props.message}</DBInfotext>
      )}
      {(props.validMessage ?? props.validation === "valid") && (
        <DBInfotext size="small" semantic="successful">
          {props.validMessage ?? DEFAULT_VALID_MESSAGE}
        </DBInfotext>
      )}
    </View>
  );
}

const DBCheckbox = forwardRef<View, DBCheckboxProps>(DBCheckboxFn);
export default DBCheckbox;
