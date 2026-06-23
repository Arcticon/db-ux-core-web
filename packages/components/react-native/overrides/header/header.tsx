import React, { forwardRef } from "react";
import { View, StatusBar } from "react-native";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";
import DBButton from "../button/button";
import DBDrawer from "../drawer/drawer";
import { DBHeaderProps } from "./model";

function mkStyles(c: typeof DBTheme.light) {
  return {
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 56,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      backgroundColor: c.bg,
    },
    brand: { marginRight: 12, flexShrink: 0 as const },
    navContainer: { flex: 1, overflow: "hidden" as const },
    actions: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4, flexShrink: 0 as const, marginLeft: 8 },
  };
}

function DBHeaderFn(props: DBHeaderProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
  const styles = mkStyles(c);
  const hasDrawer = props.onToggle !== undefined;

  function handleToggle() {
    const open = !Boolean(props.drawerOpen);
    if (props.onToggle) props.onToggle(open);
  }

  return (
    <View style={{ backgroundColor: c.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.header} ref={component}>
        {props.brand && <View style={styles.brand}>{props.brand}</View>}
        {/* Only show inline nav when there is no drawer — avoid squishing */}
        {!hasDrawer && <View style={styles.navContainer}>{props.children}</View>}
        {hasDrawer && <View style={styles.navContainer} />}
        <View style={styles.actions}>
          {props.primaryAction}
          {props.secondaryAction}
          {hasDrawer && (
            <DBButton variant="ghost" noText icon="menu" onClick={handleToggle}>
              {props.burgerMenuLabel ?? "Menu"}
            </DBButton>
          )}
        </View>
      </View>
      {hasDrawer && (
        <DBDrawer
          open={Boolean(props.drawerOpen)}
          onClose={handleToggle}
          closeButtonText={props.closeButtonText}
        >
          <View>{props.children}</View>
          {props.metaNavigation && <View>{props.metaNavigation}</View>}
        </DBDrawer>
      )}
    </View>
  );
}

const DBHeader = forwardRef<View, DBHeaderProps>(DBHeaderFn);
export default DBHeader;
