export interface DBTextProps {
  /** Semantic text style — controls colour and default size/weight. */
  variant?: "body" | "heading" | "label" | "subtle" | "caption" | "overline" | "brand" | "disabled";
  /** Override font size. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Override font weight. */
  weight?: "regular" | "medium" | "bold";
  children?: React.ReactNode;
  style?: any;
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
  onPress?: () => void;
  selectable?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}
