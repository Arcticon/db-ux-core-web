import { GlobalProps } from '../../shared/model';
export type DBTabListDefaultProps = {
  /** Use "full" to have tabs fill the available width */
  width?: "full" | "auto";
  /** Horizontal alignment of tab labels when width="full" */
  alignment?: "start" | "center";
};
export type DBTabListProps = DBTabListDefaultProps & GlobalProps;
export type DBTabListDefaultState = {};
export type DBTabListState = DBTabListDefaultState;
