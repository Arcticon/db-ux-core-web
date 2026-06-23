
/* React Native event type aliases */
import type { GestureResponderEvent, NativeSyntheticEvent, TextInputChangeEventData } from "react-native";
export type ClickEvent<_T> = GestureResponderEvent;
export type ChangeEvent<_T> = NativeSyntheticEvent<TextInputChangeEventData>;
export type InputEvent<_T> = string;
export type InteractionEvent<_T> = GestureResponderEvent;
export type GeneralEvent<_T> = GestureResponderEvent;
export type GeneralKeyboardEvent<_T> = GestureResponderEvent;
