import { ContainerWidthProps, GlobalProps, SpacingProps } from '../../shared/model';
import type { ViewStyle } from "react-native";
export type DBSectionDefaultProps = {
  /** Visual density of the section: functional (compact), regular (default), expressive (spacious) */
  density?: "functional" | "regular" | "expressive";
  /** Native style override */
  style?: ViewStyle | ViewStyle[];
};
export type DBSectionProps = DBSectionDefaultProps & GlobalProps & SpacingProps & ContainerWidthProps;
export type DBSectionDefaultState = {};
export type DBSectionState = DBSectionDefaultState;
