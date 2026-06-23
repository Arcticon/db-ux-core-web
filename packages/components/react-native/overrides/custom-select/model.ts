export type CustomSelectOptionType = { value?: string; label?: string; disabled?: boolean };
export type DBCustomSelectDefaultProps = {
  label?: string;
  placeholder?: string;
  multiple?: boolean | string;
  disabled?: boolean | string;
  required?: boolean | string;
  /** Selected value(s) — string or comma-separated string or array */
  values?: string | string[];
  options?: CustomSelectOptionType[] | string[];
  message?: string;
  validMessage?: string;
  invalidMessage?: string;
  onOptionSelected?: (values: string[]) => void;
  /** Force dropdown panel (default on web) */
  forceDropdown?: boolean;
  /** Force fullscreen bottom-sheet (default on mobile) */
  forceFullscreen?: boolean;
};
import { GlobalProps } from "../../shared/model";
export type DBCustomSelectProps = DBCustomSelectDefaultProps & GlobalProps;
