import type { StyleProp, TextStyle } from "react-native";
import {
  GlobalProps,
  GlobalState,
  IconProps,
  TextProps,
} from "../../shared/model";

export const IconWeightList = ["16", "20", "24", "32", "48", "64"] as const;
export type IconWeightType = (typeof IconWeightList)[number];
export type DBIconDefaultProps = {
  variant?: string;
  weight?: IconWeightType;
  style?: StyleProp<TextStyle>;
};
export type DBIconProps = DBIconDefaultProps &
  GlobalProps &
  IconProps &
  TextProps;
export type DBIconDefaultState = {};
export type DBIconState = DBIconDefaultState & GlobalState;
export type UnderscoreToDash<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}-${UnderscoreToDash<Tail>}`
    : S;
