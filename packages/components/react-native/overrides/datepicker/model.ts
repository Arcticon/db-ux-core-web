import { FormMessageProps, FormProps, GlobalProps } from "../../shared/model";

export const DatepickerSizeList = ["s", "m", "l", "xl"] as const;
export type DatepickerSizeType = (typeof DatepickerSizeList)[number];

export type DBDatepickerDefaultProps = {
  /**
   * Datepicker presentation mode.
   * - "responsive-modal": modal card on tablet/web and fullscreen on mobile (default)
   * - "floating": anchored floating panel next to the input on tablet/web and fullscreen on mobile
   */
  presentation?: "responsive-modal" | "floating";
  /** Datepicker size variant. Defaults to "m". */
  size?: DatepickerSizeType;
  /** Gap in pixels between the floating panel and the input. Defaults to 4. Only applies in floating presentation mode. */
  floatingGap?: number;
  /** Current value as Date or ISO date string (YYYY-MM-DD). */
  value?: Date | string;
  /** Placeholder shown when no date is selected. */
  placeholder?: string;
  /** Lowest selectable date (inclusive). */
  min?: Date | string;
  /** Highest selectable date (inclusive). */
  max?: Date | string;
  /** Optional locale for month and weekday labels. */
  locale?: string;
  /** Week start day (0 = Sunday, 1 = Monday). Defaults to 1. */
  firstDayOfWeek?: 0 | 1;
  /** Label of the clear action in the picker footer. */
  clearLabel?: string;
  /** Label of the cancel action in the picker footer. */
  cancelLabel?: string;
  /** Label of the confirm action in the picker footer. */
  confirmLabel?: string;
  /** Invoked with an event-like payload to align with existing form APIs. */
  onChange?: (event: { target: { value: string } }) => void;
  /** Convenience callback with both ISO date and Date object. */
  onDateChange?: (isoDate: string, date: Date) => void;
};

export type DBDatepickerProps = DBDatepickerDefaultProps & FormProps & FormMessageProps & GlobalProps;
