import React, { forwardRef, useState, useEffect } from "react";
import { View, TextInput as RNTextInput } from "react-native";
import DBText from "../text/text";
import DBInfotext from "../infotext/infotext";
import { DEFAULT_INVALID_MESSAGE, DEFAULT_VALID_MESSAGE } from "../../shared/constants";
import { stringPropVisible } from "../../utils";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBColors, DBTypography, DBSpacing, DBBorderRadius } from "../../shared/tokens";
import { DBInputProps } from "./model";

function mkStyles(c: typeof DBTheme.light) {
  return {
    container: { marginVertical: DBSpacing.xs },
    label: { fontSize: DBTypography.size2XS, color: c.textMuted, marginBottom: DBSpacing.xs },
    required: { color: c.brandPrimary },
    input: { borderWidth: 1, borderColor: c.borderStrong, borderRadius: DBBorderRadius.sm, padding: 10, fontSize: DBTypography.sizeSM, backgroundColor: c.inputBg, color: c.text },
    focused: { borderColor: DBColors.informational.origin, borderWidth: 2 },
    invalid: { borderColor: DBColors.critical.origin },
    valid: { borderColor: DBColors.successful.origin },
    disabled: { borderColor: c.textDisabled, backgroundColor: c.bgSurface, color: c.textDisabled },
    description: { fontSize: DBTypography.size2XS, color: c.textSubtle, marginTop: DBSpacing.xs },
  };
}

function DBInputFn(props: DBInputProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const [value, setValue] = useState(String(props.value ?? ""));
  const [focused, setFocused] = useState(false);
  const isInvalid = props.validation === "invalid";
  const isValid = !!(props.validMessage ?? props.validation === "valid") && props.validation === "valid";

  useEffect(() => { setValue(String(props.value ?? "")); }, [props.value]);

  const styles = mkStyles(c);

  return (
    <View style={styles.container} ref={component}>
      {props.label && (
        <DBText style={styles.label}>
          {props.label}{props.required && <DBText style={styles.required}> *</DBText>}
        </DBText>
      )}
      <RNTextInput
        style={[styles.input, focused && styles.focused, isInvalid && styles.invalid, isValid && styles.valid, Boolean(props.disabled) && styles.disabled]}
        value={value}
        onChangeText={(t) => { setValue(t); if (props.onChange) (props.onChange as any)({ target: { value: t } }); }}
        placeholder={String(props.placeholder ?? "")}
        placeholderTextColor={c.textSubtle}
        editable={!Boolean(props.disabled)}
        secureTextEntry={props.type === "password"}
        keyboardType={props.type === "email" ? "email-address" : props.type === "number" || props.type === "tel" ? "numeric" : "default"}
        maxLength={typeof props.maxLength === "number" ? props.maxLength : undefined}
        accessibilityLabel={props.label ?? props.placeholder}
        onFocus={() => { setFocused(true); if (props.onFocus) (props.onFocus as any)(); }}
        onBlur={() => { setFocused(false); if (props.onBlur) (props.onBlur as any)(); }}
      />
      {(props as any).description && <DBText style={styles.description}>{(props as any).description}</DBText>}
      {stringPropVisible(props.message, props.showMessage) && (
        <DBInfotext size="small" semantic="adaptive">{props.message}</DBInfotext>
      )}
      {isValid && <DBInfotext size="small" semantic="successful">{props.validMessage ?? DEFAULT_VALID_MESSAGE}</DBInfotext>}
      {isInvalid && <DBInfotext size="small" semantic="critical">{props.invalidMessage ?? DEFAULT_INVALID_MESSAGE}</DBInfotext>}
    </View>
  );
}

const DBInput = forwardRef<RNTextInput, DBInputProps>(DBInputFn);
export default DBInput;
