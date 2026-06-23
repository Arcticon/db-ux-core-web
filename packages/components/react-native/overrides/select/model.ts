export type DBSelectOptionType = { value?: string; label?: string; disabled?: boolean };
export type DBSelectDefaultProps = {
  multiple?: boolean;
  /** Options as label/value objects or plain strings */
  options?: DBSelectOptionType[] | string[];
  value?: string | string[];
  placeholder?: string;
  label?: string;
  disabled?: boolean | string;
  required?: boolean | string;
  invalid?: boolean | string;
  valid?: boolean | string;
  message?: string;
  validMessage?: string;
  invalidMessage?: string;
  onChange?: (v: string | string[]) => void;
  /** Force dropdown panel behaviour on all platforms (default on web) */
  forceDropdown?: boolean;
  /** Force bottom-sheet behaviour on all platforms (default on mobile) */
  forceFullscreen?: boolean;
};
import { GlobalProps } from "../../shared/model";
export type DBSelectProps = DBSelectDefaultProps & GlobalProps;
