import React, { forwardRef, useId } from "react";
import { View, Switch as RNSwitch } from "react-native";
import DBText from "../text/text";
import DBInfotext from "../infotext/infotext";
import { DEFAULT_VALID_MESSAGE } from "../../shared/constants";
import { stringPropVisible } from "../../utils";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme, DBTypography, DBSpacing } from "../../shared/tokens";
import { DBSwitchProps } from "./model";

function mkStyles(c: typeof DBTheme.light) {
  return {
    container: { marginVertical: DBSpacing.sm },
    row: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const },
    label: { flex: 1, fontSize: DBTypography.sizeSM, color: c.text },
  };
}

function DBSwitchFn(props: DBSwitchProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;

  const styles = mkStyles(c);
  const uuid = useId();

  function hasValidState() {
    return !!(props.validMessage ?? props.validation === "valid");
  }

  return (
    <View style={styles.container} ref={component}>
      <View style={styles.row}>
        {(props.label || props.children) && (
          <DBText style={styles.label}>{props.label ?? props.children}</DBText>
        )}
        <RNSwitch
          value={Boolean(props.checked)}
          onValueChange={(val) => {
            if (props.onChange) (props.onChange as any)({ target: { checked: val, value: val ? "on" : "off" } });
          }}
          disabled={Boolean(props.disabled)}
          trackColor={{ false: c.switchTrack, true: c.brandPrimary }}
          thumbColor={c.bg}
          accessibilityLabel={props.label ?? String(props.children ?? "")}
        />
      </View>
      {stringPropVisible(props.message, props.showMessage) && (
        <DBInfotext size="small" semantic="adaptive">{props.message}</DBInfotext>
      )}
      {hasValidState() && (
        <DBInfotext size="small" semantic="successful">
          {props.validMessage ?? DEFAULT_VALID_MESSAGE}
        </DBInfotext>
      )}
    </View>
  );
}

const DBSwitch = forwardRef<View, DBSwitchProps>(DBSwitchFn);
export default DBSwitch;
