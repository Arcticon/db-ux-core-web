import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import { useFonts } from "expo-font";
import { DBFontFamily } from "../shared/tokens";

export interface DBFontSources {
  /** Require path to the regular weight font file. */
  regular: any;
  /** Require path to the medium weight font file. */
  medium: any;
  /** Require path to the bold weight font file. */
  bold: any;
  /** Require path to the semibold weight font file. Falls back to medium. */
  semibold?: any;
}

interface DBFontContextValue {
  /** True when the active color scheme is dark. */
  isDark: boolean;
  /** Resolved font family names — always use these in component styles. */
  fontFamily: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

const DEFAULT_FONT_FAMILY = {
  regular:  DBFontFamily.regular,
  medium:   DBFontFamily.medium,
  semibold: DBFontFamily.semibold,
  bold:     DBFontFamily.bold,
};

const DBFontContext = createContext<DBFontContextValue>({
  isDark: false,
  fontFamily: DEFAULT_FONT_FAMILY,
});

/**
 * Wrap your app root with DBFontProvider. It loads fonts internally and
 * exposes them to all DB UX components via context — no manual useFonts needed.
 *
 * @example
 * <DBFontProvider
 *   fonts={{
 *     regular:  require('./assets/fonts/MyFont-Regular.ttf'),
 *     medium:   require('./assets/fonts/MyFont-Medium.ttf'),
 *     bold:     require('./assets/fonts/MyFont-Bold.ttf'),
 *   }}
 *   colorScheme="auto"
 * >
 *   <App />
 * </DBFontProvider>
 */
export function DBFontProvider({
  children,
  fonts,
  colorScheme = 'auto',
}: {
  children: React.ReactNode;
  /** Font source files to load. If omitted, the system font is used. */
  fonts?: DBFontSources;
  /** 'light' | 'dark' | 'auto' (follows system preference). Default: 'auto'. */
  colorScheme?: 'light' | 'dark' | 'auto';
}) {
  const fontMap = fonts ? {
    [DBFontFamily.regular]:  fonts.regular,
    [DBFontFamily.medium]:   fonts.medium,
    [DBFontFamily.semibold]: fonts.semibold ?? fonts.medium,
    [DBFontFamily.bold]:     fonts.bold,
  } : {};

  const [fontsLoaded] = useFonts(fontMap);

  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme: s }) => {
      setSystemScheme(s === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  const resolved = colorScheme === 'auto' ? systemScheme : colorScheme;
  const isDark = resolved === 'dark';

  // Wait for fonts if custom fonts were provided
  if (fonts && !fontsLoaded) return null;

  return (
    <DBFontContext.Provider value={{ isDark, fontFamily: DEFAULT_FONT_FAMILY }}>
      {children}
    </DBFontContext.Provider>
  );
}

export function useDBFont(): DBFontContextValue {
  return useContext(DBFontContext);
}
