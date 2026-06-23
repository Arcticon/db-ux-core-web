import React, { forwardRef, useState, useEffect } from "react";
import { View, TextInput as RNTextInput } from "react-native";
import DBText from "../text/text";
import DBInfotext from "../infotext/infotext";
import { DEFAULT_INVALID_MESSAGE, DEFAULT_VALID_MESSAGE } from "../../shared/constants";
import { stringPropVisible } from "../../utils";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBColors, DBTypography, DBSpacing, DBBorderRadius } from "../../shared/tokens";
import { DBTextareaProps } from "./model";

function mkStyles(c: typeof DBTheme.light) {
  return {
    container: { marginVertical: DBSpacing.xs },
    label: { fontSize: DBTypography.size2XS, color: c.textMuted, marginBottom: DBSpacing.xs },
    required: { color: c.brandPrimary },
    input: { borderWidth: 1, borderColor: c.borderStrong, borderRadius: DBBorderRadius.sm, padding: 10, fontSize: DBTypography.sizeSM, backgroundColor: c.inputBg, color: c.text, minHeight: 80 },
    invalid: { borderColor: DBColors.critical.origin },
    valid: { borderColor: DBColors.successful.origin },
    disabled: { borderColor: c.textDisabled, backgroundColor: c.bgSurface, color: c.textDisabled },
  };
}

function DBTextareaFn(props: DBTextareaProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const [value, setValue] = useState(String(props.value ?? ""));
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
        style={[styles.input, isInvalid && styles.invalid, isValid && styles.valid, Boolean(props.disabled) && styles.disabled]}
        value={value}
        onChangeText={(t) => { setValue(t); if (props.onChange) (props.onChange as any)({ target: { value: t } }); }}
        placeholder={String(props.placeholder ?? "")}
        placeholderTextColor={c.textSubtle}
        editable={!Boolean(props.disabled)}
        multiline
        numberOfLines={typeof props.rows === "number" ? props.rows : 4}
        textAlignVertical="top"
        maxLength={typeof props.maxLength === "number" ? props.maxLength : undefined}
        accessibilityLabel={props.label ?? props.placeholder}
      />
      {stringPropVisible(props.message, props.showMessage) && (
        <DBInfotext size="small" semantic="adaptive">{props.message}</DBInfotext>
      )}
      {isValid && <DBInfotext size="small" semantic="successful">{props.validMessage ?? DEFAULT_VALID_MESSAGE}</DBInfotext>}
      {isInvalid && <DBInfotext size="small" semantic="critical">{props.invalidMessage ?? DEFAULT_INVALID_MESSAGE}</DBInfotext>}
    </View>
  );
}

const DBTextarea = forwardRef<RNTextInput, DBTextareaProps>(DBTextareaFn);
export default DBTextarea;
