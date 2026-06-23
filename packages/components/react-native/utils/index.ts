import React from "react";

export const uuid = (): string =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

export type ClassNameArg = string | Record<string, boolean | undefined> | undefined;

/** No-op in React Native — CSS class names have no meaning here */
export const cls = (..._args: ClassNameArg[]): string => "";

export const isArrayOfStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export const hasVoiceOver = (): boolean => false;
export const isIOSSafari = (): boolean => false;

export const delay = (fn: () => void, ms = 0): Promise<void> =>
  new Promise((resolve) => setTimeout(() => { fn(); resolve(); }, ms));

export const getBoolean = (
  value: boolean | string | undefined,
  _attr?: string
): boolean | undefined => {
  if (value == null) return undefined;
  if (typeof value === "boolean") return value;
  return value !== "false" && value !== "";
};

export const getBooleanAsString = (value: boolean | string | undefined): string | undefined => {
  if (value == null) return undefined;
  return String(value);
};

export const getHideProp = (show?: boolean | string): string | undefined => {
  if (show == null) return undefined;
  return getBoolean(show) ? "false" : "true";
};

export const getNumber = (value: string | number | undefined): number | undefined => {
  if (value == null) return undefined;
  const n = Number(value);
  return isNaN(n) ? undefined : n;
};

export const getStep = (value: string | number | undefined): number | string | undefined =>
  value ?? undefined;

export const getInputValue = (value: unknown): string => String(value ?? "");

export const getOptionKey = (
  option: unknown,
  index: number,
  prefix = ""
): string => {
  if (typeof option === "string") return `${prefix}${option}`;
  if (typeof option === "object" && option !== null) {
    const o = option as Record<string, unknown>;
    return `${prefix}${o["value"] ?? o["label"] ?? index}`;
  }
  return `${prefix}${index}`;
};

export const stringPropVisible = (
  value: string | undefined,
  show: boolean | string | undefined
): boolean => {
  if (!value) return false;
  if (show === undefined) return true;
  return getBoolean(show) !== false;
};

/** Notification role — always "alert" in RN (no live regions) */
export const getNotificationRole = (_semantic?: string): string => "alert";

export const isKeyboardEvent = <T>(_event: unknown): _event is React.KeyboardEvent<T> =>
  false;

export const addAttributeToChildren = (..._args: unknown[]): void => {};
