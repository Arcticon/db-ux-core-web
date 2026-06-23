import { GlobalProps, InitializedState, NameProps, NameState, TextProps, ToggleEventProps, ToggleEventState } from '../../shared/model';
export type DBAccordionItemDefaultProps = {
  defaultOpen?: boolean;
  disabled?: boolean | string;
  headline?: any;
  headlinePlain?: string;
  /** Plain-text content rendered inside the accordion body */
  content?: string;
} & TextProps;
export type DBAccordionItemProps = DBAccordionItemDefaultProps & GlobalProps & ToggleEventProps & NameProps;
export type DBAccordionItemDefaultState = { _open?: boolean };
export type DBAccordionItemState = DBAccordionItemDefaultState & ToggleEventState<HTMLElement> & InitializedState & NameState;
