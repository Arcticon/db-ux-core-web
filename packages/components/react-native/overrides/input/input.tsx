import React, { forwardRef, useState, useEffect } from "react";
import { View, TextInput as RNTextInput } from "react-native";
import DBText from "../text/text";
import DBInfotext from "../infotext/infotext";
import { DEFAULT_INVALID_MESSAGE, DEFAULT_VALID_MESSAGE } from "../../shared/constants";
import { stringPropVisible } from "../../utils";
import { useDBFont } from "../../providers/font-provider";
import {
  DBTheme,
  DBColors,
  DBTypography,
  DBSpacing,
  DBBorderRadius,
  DBFontFamily,
} from "../../shared/tokens";
import { DBInputProps } from "./model";
import { DBButton } from "../button";
import { DBIcon } from "../icon";

function DBInputFn(props: DBInputProps, component: any) {
  const { isDark } = useDBFont();
  const theme = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const [value, setValue] = useState(String(props.value ?? ""));
  const [focused, setFocused] = useState(false);
  const isInvalid = props.validation === "invalid";
  const isValid =
    !!(props.validMessage ?? props.validation === "valid") &&
    props.validation === "valid";

  useEffect(() => {
    setValue(String(props.value ?? ""));
  }, [props.value]);

  const styles = mkStyles(theme);
  const showIcon = props.showIconLeading ?? props.showIcon;
  const showIconTrailing = props.showIconTrailing;
  const filePickerColor = (props.variant === "filled" || props.variant === "brand") ? theme.bg : theme.text;
  const textStyle = {
    ...(Boolean(props.disabled) &&
      !(props.variant === "filled" || props.variant === "brand") &&
      styles.labelDisabled),
  };

  return (
    <View style={styles.container} ref={component}>
      {props.label && (
        <DBText style={styles.label}>
          {props.label}
          {props.required && <DBText style={styles.required}> *</DBText>}
        </DBText>
      )}
      {props.type === "file" ? (
        props.value ? (
          <View
            style={{
              gap: DBSpacing.md,
            }}>
            <View style={styles.selectedFileWrapper}>
              {showIcon && (
                <DBIcon
                  icon={props.iconLeading ?? props.icon}
                  weight="24"
                  style={styles.filePickerLeadingIcon}
                />
              )}
              <DBText
                style={[styles.fileLabel, textStyle]}
                numberOfLines={1}
                ellipsizeMode="middle">
                {props.value}
              </DBText>
              <DBButton variant="ghost" onClick={props.onClearFile}>
                <DBIcon icon="close" weight="24" />
              </DBButton>
            </View>
            {props.fileTooLargeText && (
              <DBText
                style={[
                  styles.label,
                  textStyle,
                  { color: DBColors.brand.origin },
                ]}>
                {props.fileTooLargeText}
              </DBText>
            )}
          </View>
        ) : (
          <DBButton variant={props.variant} onClick={props.onFilePick}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: DBSpacing.md,
              }}>
              {showIcon && (
                <DBIcon
                  icon={props.iconLeading ?? props.icon}
                  weight="24"
                  style={{
                    ...styles.filePickerLeadingIcon,
                    color: filePickerColor,
                  }}
                />
              )}
              <DBText
                weight="bold"
                style={{
                  fontFamily: DBFontFamily.bold,
                  fontSize: 16,
                  color: filePickerColor,
                }}>
                {props.placeholder}
              </DBText>
              {showIconTrailing && (
                <DBIcon
                  icon={props.iconTrailing}
                  style={{
                    ...styles.filePickerTrailingIcon,
                    color: filePickerColor,
                  }}
                />
              )}
            </View>
          </DBButton>
        )
      ) : (
        <RNTextInput
          style={[
            styles.input,
            focused && styles.focused,
            isInvalid && styles.invalid,
            isValid && styles.valid,
            Boolean(props.disabled) && styles.disabled,
            props.inputStyle,
          ]}
          value={value}
          onChangeText={(t) => {
            setValue(t);
            if (props.onChange)
              (props.onChange as any)({ target: { value: t } });
          }}
          placeholder={String(props.placeholder ?? "")}
          placeholderTextColor={theme.textSubtle}
          editable={!Boolean(props.disabled)}
          secureTextEntry={props.type === "password"}
          keyboardType={
            props.type === "email"
              ? "email-address"
              : props.type === "number" || props.type === "tel"
                ? "numeric"
                : "default"
          }
          maxLength={
            typeof props.maxLength === "number" ? props.maxLength : undefined
          }
          accessibilityLabel={props.label ?? props.placeholder}
          onFocus={() => {
            setFocused(true);
            if (props.onFocus) (props.onFocus as any)();
          }}
          onBlur={() => {
            setFocused(false);
            if (props.onBlur) (props.onBlur as any)();
          }}
        />
      )}
      {(props as any).description && (
        <DBText style={styles.description}>{(props as any).description}</DBText>
      )}
      {stringPropVisible(props.message, props.showMessage) && (
        <DBInfotext size="small" semantic="adaptive">
          {props.message}
        </DBInfotext>
      )}
      {isValid && (
        <DBInfotext size="small" semantic="successful">
          {props.validMessage ?? DEFAULT_VALID_MESSAGE}
        </DBInfotext>
      )}
      {isInvalid && (
        <DBInfotext size="small" semantic="critical">
          {props.invalidMessage ?? DEFAULT_INVALID_MESSAGE}
        </DBInfotext>
      )}
    </View>
  );
}

function mkStyles(theme: typeof DBTheme.light) {
  return {
    container: { marginVertical: DBSpacing.xs },
    label: {
      fontSize: DBTypography.size2XS,
      color: theme.textMuted,
      marginBottom: DBSpacing.xs,
    },
    required: { color: theme.brandPrimary },
    input: {
      borderWidth: 1,
      borderColor: theme.borderStrong,
      borderRadius: DBBorderRadius.sm,
      padding: 10,
      fontSize: DBTypography.sizeSM,
      backgroundColor: theme.inputBg,
      color: theme.text,
    },
    focused: { borderColor: DBColors.informational.origin, borderWidth: 2 },
    invalid: { borderColor: DBColors.critical.origin },
    valid: { borderColor: DBColors.successful.origin },
    disabled: {
      borderColor: theme.textDisabled,
      backgroundColor: theme.bgSurface,
      color: theme.textDisabled,
    },
    description: {
      fontSize: DBTypography.size2XS,
      color: theme.textSubtle,
      marginTop: DBSpacing.xs,
    },
    selectedFileWrapper: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      backgroundColor: DBColors.neutral[14],
      paddingVertical: DBSpacing.md,
      paddingHorizontal: DBSpacing.lg,
      borderRadius: DBBorderRadius.md,
      gap: DBSpacing.md,
      alignSelf: "flex-start" as const,
      boxShadow: "0 6px 10px 0 rgba(0, 0, 0, 0.1)",
      height: 56,
      flexGrow: 1,
      flexShrink: 1,
      inlineSize: "100%",
    },
    fileLabel: {
      fontSize: DBTypography.sizeSM,
      color: theme.text,
      fontWeight: DBTypography.weightMedium,
    },
    labelDisabled: { color: theme.textDisabled },
    filePickerLeadingIcon: {
      color: DBTheme.light.text,
      marginInlineEnd: 4,
    },
    filePickerTrailingIcon: {
      color: DBTheme.light.text,
      marginInlineEnd: 4,
    },
  };
}

const DBInput = forwardRef<RNTextInput, DBInputProps>(DBInputFn);
export default DBInput;
