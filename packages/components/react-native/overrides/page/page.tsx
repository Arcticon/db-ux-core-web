import React, { forwardRef } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DBTheme } from "../../shared/tokens";
import { DBPageProps } from "./model";

function mkStyles(c: typeof DBTheme.light) {
  return {
    page: { flex: 1, backgroundColor: c.bg },
    headerSlot: {},
    main: { flex: 1 },
    footerSlot: {},
  };
}

function DBPageFn(props: DBPageProps, component: any) {
  const { isDark } = useDBFont();
  const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;

  const styles = mkStyles(c);
  return (
    <SafeAreaView style={styles.page} ref={component}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {props.header && <View style={styles.headerSlot}>{props.header}</View>}
      <View style={styles.main}>{props.children}</View>
      {props.footer && <View style={styles.footerSlot}>{props.footer}</View>}
    </SafeAreaView>
  );
}

const DBPage = forwardRef<View, DBPageProps>(DBPageFn);
export default DBPage;
