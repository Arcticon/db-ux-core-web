import type React from "react";

export interface DBIconToggleOption {
  /** DB icon name — same string as the DBIcon `icon` prop (e.g. "light_mode", "dark_mode") */
  icon: string;
  /** Unique value for this option */
  value: string;
  /** Accessibility label (falls back to value) */
  label?: string;
}

export interface DBIconToggleProps {
  /** Toggle options to render */
  options: DBIconToggleOption[];
  /** Currently selected value */
  value: string;
  /** Called when the user selects a different option */
  onChange: (value: string) => void;
}
