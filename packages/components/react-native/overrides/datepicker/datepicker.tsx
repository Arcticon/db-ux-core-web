import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import DBInfotext from "../infotext/infotext";
import DBText from "../text/text";
import { useDBFont } from "../../providers/font-provider";
import { DEFAULT_INVALID_MESSAGE, DEFAULT_VALID_MESSAGE } from "../../shared/constants";
import { DBColors, DBBorderRadius, DBSpacing, DBTheme, DBTypography } from "../../shared/tokens";
import { stringPropVisible } from "../../utils";
import { DBDatepickerProps } from "./model";

const SIZE_PANEL_CONFIG = {
    s: { minWidth: 220, baseWidth: 240, maxWidth: 280, maxHeight: 440 },
    m: { minWidth: 240, baseWidth: 260, maxWidth: 340, maxHeight: 480 },
    l: { minWidth: 280, baseWidth: 320, maxWidth: 400, maxHeight: 520 },
    xl: { minWidth: 320, baseWidth: 360, maxWidth: 460, maxHeight: 560 },
} as const;

function mkStyles(c: typeof DBTheme.light) {
    return {
        container: { marginVertical: DBSpacing.xs },
        label: { fontSize: DBTypography.size2XS, color: c.textMuted, marginBottom: DBSpacing.xs },
        required: { color: c.brandPrimary },
        trigger: {
            flexDirection: "row" as const,
            alignItems: "center" as const,
            borderWidth: 1,
            borderColor: c.borderStrong,
            borderRadius: DBBorderRadius.sm,
            padding: 10,
            backgroundColor: c.inputBg,
        },
        triggerDisabled: { borderColor: c.textDisabled, backgroundColor: c.bgSurface },
        triggerFocused: { borderColor: DBColors.informational.origin },
        triggerInvalid: { borderColor: DBColors.critical.origin },
        triggerValid: { borderColor: DBColors.successful.origin },
        triggerText: { flex: 1, fontSize: DBTypography.sizeSM, color: c.text },
        triggerPlaceholder: { color: c.textSubtle },
        triggerIcon: { fontSize: DBTypography.sizeSM, color: c.textMuted },
        backdrop: {
            flex: 1,
            justifyContent: "flex-end" as const,
            backgroundColor: "rgba(0,0,0,0.35)",
        },
        sheet: {
            backgroundColor: c.bg,
            borderTopLeftRadius: DBBorderRadius.lg,
            borderTopRightRadius: DBBorderRadius.lg,
            padding: DBSpacing.md,
            gap: DBSpacing.sm,
        },
        monthHeader: {
            flexDirection: "row" as const,
            alignItems: "center" as const,
            justifyContent: "space-between" as const,
            marginBottom: DBSpacing.xs,
        },
        monthButton: {
            width: 34,
            height: 34,
            borderRadius: DBBorderRadius.full,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            backgroundColor: c.bgElevated,
        },
        monthButtonText: { color: c.text, fontSize: DBTypography.sizeMD, lineHeight: 20 },
        monthTitle: { fontSize: DBTypography.sizeMD, fontWeight: DBTypography.weightBold, color: c.text },
        monthTitleYear: { fontSize: DBTypography.sizeSM, fontWeight: DBTypography.weightMedium, color: c.textSubtle },
        weekdaysRow: {
            flexDirection: "row" as const,
            justifyContent: "space-between" as const,
            paddingHorizontal: 2,
            paddingBottom: DBSpacing.xs,
            marginBottom: DBSpacing.xs,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
        },
        weekday: { flex: 1, textAlign: "center" as const, color: c.textMuted, fontSize: DBTypography.size2XS, fontWeight: DBTypography.weightMedium },
        daysGrid: {
            flexDirection: "row" as const,
            flexWrap: "wrap" as const,
            marginBottom: DBSpacing.sm,
        },
        dayCell: {
            width: "14.2857%" as any,
            aspectRatio: 1,
            padding: 2,
        },
        dayButton: {
            flex: 1,
            borderRadius: DBBorderRadius.full,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            borderWidth: 1,
            borderColor: "transparent",
        },
        dayOutsideMonth: { opacity: 0.4 },
        dayDisabled: { opacity: 0.3 },
        dayToday: { backgroundColor: c.bgElevated },
        daySelected: { backgroundColor: c.brandPrimary, borderColor: c.brandPrimary },
        dayPressed: { backgroundColor: c.bgElevated },
        dayText: { color: c.text, fontSize: DBTypography.sizeSM },
        dayTextToday: { color: c.brandPrimary, fontWeight: DBTypography.weightBold } as object,
        dayTextSelected: { color: c.bg, fontWeight: DBTypography.weightBold },
        monthTitlePressable: {
            flexDirection: "row" as const,
            alignItems: "center" as const,
            gap: 6,
            paddingHorizontal: DBSpacing.xs,
            paddingVertical: DBSpacing.xs,
            borderRadius: DBBorderRadius.sm,
        },
        monthTitleActive: { backgroundColor: c.bgElevated },
        quickPickGrid: {
            flexDirection: "row" as const,
            flexWrap: "wrap" as const,
            marginBottom: DBSpacing.sm,
        },
        quickPickCell: {
            width: "33.333%" as any,
            padding: 3,
        },
        yearPickCell: {
            width: "25%" as any,
            padding: 3,
        },
        quickPickButton: {
            borderRadius: DBBorderRadius.full,
            alignItems: "center" as const,
            justifyContent: "center" as const,
            paddingVertical: DBSpacing.sm + 2,
        },
        quickPickButtonSelected: { backgroundColor: c.brandPrimary },
        quickPickButtonToday: { backgroundColor: c.bgElevated },
        quickPickButtonPressed: { backgroundColor: c.bgElevated },
        quickPickText: { fontSize: DBTypography.sizeSM, color: c.text },
        quickPickTextSelected: { color: c.bg, fontWeight: DBTypography.weightBold },
        quickPickTextMuted: { color: c.textSubtle },
        headerChevron: { fontSize: 10, color: c.textSubtle, marginTop: 1 },
        footer: {
            flexDirection: "row" as const,
            justifyContent: "flex-end" as const,
            gap: DBSpacing.xs,
            marginTop: DBSpacing.xs,
            paddingTop: DBSpacing.sm,
            borderTopWidth: 1,
            borderTopColor: c.border,
        },
        footerButton: {
            paddingVertical: DBSpacing.sm,
            paddingHorizontal: DBSpacing.md,
            borderRadius: DBBorderRadius.sm,
            alignItems: "center" as const,
            justifyContent: "center" as const,
        },
        footerButtonBrand: {
            backgroundColor: c.brandPrimary,
        },
        footerButtonText: {
            color: c.textSubtle,
            fontSize: DBTypography.sizeSM,
            fontWeight: DBTypography.weightMedium,
        },
        footerButtonTextBrand: {
            color: c.bg,
        },
        footerButtonTextClear: {
            color: c.textSubtle,
            fontSize: DBTypography.sizeSM,
            fontWeight: DBTypography.weightMedium,
        },
        modalBackdrop: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "center" as const,
            alignItems: "center" as const,
            padding: DBSpacing.lg,
        },
        modalCard: {
            width: "100%" as any,
            maxWidth: 420,
            maxHeight: "88%" as any,
            borderRadius: DBBorderRadius.lg,
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.bg,
            overflow: "hidden" as const,
        },
        modalSheet: {
            borderRadius: DBBorderRadius.lg,
        },
        fullscreenWrap: {
            flex: 1,
            backgroundColor: c.bg,
        },
        fullscreenSheet: {
            flex: 1,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            padding: DBSpacing.lg,
            gap: DBSpacing.md,
        },
        floatingBackdrop: {
            flex: 1,
            backgroundColor: "transparent",
        },
        floatingPanel: {
            position: "absolute" as const,
            maxWidth: 340,
            maxHeight: 360,
            borderRadius: DBBorderRadius.lg,
            borderWidth: 1,
            borderColor: c.border,
            backgroundColor: c.bg,
            overflow: "hidden" as const,
            shadowColor: c.shadowColor,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.2,
            shadowRadius: 22,
            elevation: 14,
        },
        floatingSheet: {
            padding: DBSpacing.sm,
        },
    };
}

function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

function parseDate(input?: Date | string): Date | null {
    if (!input) return null;
    if (input instanceof Date) {
        const parsed = new Date(input.getFullYear(), input.getMonth(), input.getDate());
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const raw = String(input).trim();
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
        const year = Number(iso[1]);
        const month = Number(iso[2]) - 1;
        const day = Number(iso[3]);
        const parsed = new Date(year, month, day);
        if (
            parsed.getFullYear() === year
            && parsed.getMonth() === month
            && parsed.getDate() === day
        ) {
            return parsed;
        }
        return null;
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function sameDay(a: Date | null, b: Date | null): boolean {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function clampDate(date: Date, min: Date | null, max: Date | null): Date {
    if (min && date < min) return min;
    if (max && date > max) return max;
    return date;
}

function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function getWeekdayLabels(locale: string, firstDayOfWeek: 0 | 1): string[] {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const base = new Date(2024, 0, 7); // Sunday
    const labels = Array.from({ length: 7 }, (_, index) => formatter.format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + index)));
    if (firstDayOfWeek === 0) return labels;
    return [...labels.slice(1), labels[0]];
}

function getVisibleDays(monthDate: Date, firstDayOfWeek: 0 | 1): Date[] {
    const firstOfMonth = startOfMonth(monthDate);
    const nativeWeekDay = firstOfMonth.getDay();
    const leadingDays = (nativeWeekDay - firstDayOfWeek + 7) % 7;
    const gridStart = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1 - leadingDays);

    return Array.from({ length: 42 }, (_, index) => (
        new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index)
    ));
}

function DBDatepickerFn(props: DBDatepickerProps, component: any) {
    const { width, height } = useWindowDimensions();
    const isTabletOrDesktop = width >= 768;
    const isFullscreen = !isTabletOrDesktop;
    const isFloatingMode = props.presentation === "floating" && !isFullscreen;
    const triggerRef = useRef<View>(null);
    const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [panelHeight, setPanelHeight] = useState(0);

    const { isDark } = useDBFont();
    const c = (isDark ? DBTheme.dark : DBTheme.light) as typeof DBTheme.light;
    const styles = mkStyles(c);

    const locale = props.locale ?? "en-GB";
    const firstDayOfWeek = props.firstDayOfWeek ?? 1;
    const sizeKey = props.size ?? "m";
    const sizeConfig = SIZE_PANEL_CONFIG[sizeKey];

    const today = useMemo(() => new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), []);
    const minDate = useMemo(() => parseDate(props.min), [props.min]);
    const maxDate = useMemo(() => parseDate(props.max), [props.max]);
    const selectedValue = useMemo(() => parseDate(props.value), [props.value]);

    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(selectedValue);
    const [draftDate, setDraftDate] = useState<Date | null>(selectedValue);
    const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(selectedValue ?? today));

    useEffect(() => {
        setSelectedDate(selectedValue);
    }, [selectedValue]);

    const isInvalid = props.validation === "invalid";
    const isValid = !!(props.validMessage ?? props.validation === "valid") && props.validation === "valid";

    const dateFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }), [locale]);
    const monthFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }), [locale]);
    const shortMonthFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short" }), [locale]);
    const weekdayLabels = useMemo(() => getWeekdayLabels(locale, firstDayOfWeek), [locale, firstDayOfWeek]);

    const [pickerView, setPickerView] = useState<"days" | "months" | "years">("days");

    const visibleDays = useMemo(() => getVisibleDays(visibleMonth, firstDayOfWeek), [visibleMonth, firstDayOfWeek]);

    function isDateDisabled(date: Date): boolean {
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    }

    function commitDate(next: Date | null) {
        const safeDate = next ? clampDate(next, minDate, maxDate) : null;
        setSelectedDate(safeDate);
        const iso = safeDate ? toIsoDate(safeDate) : "";
        if (props.onChange) props.onChange({ target: { value: iso } });
        if (safeDate && props.onDateChange) props.onDateChange(iso, safeDate);
    }

    function openPicker() {
        if (Boolean(props.disabled)) return;
        const baseDate = clampDate(selectedDate ?? today, minDate, maxDate);
        setDraftDate(selectedDate ? clampDate(selectedDate, minDate, maxDate) : null);
        setVisibleMonth(startOfMonth(baseDate));

        if (isFloatingMode && triggerRef.current) {
            (triggerRef.current as any).measureInWindow((x: number, y: number, w: number, h: number) => {
                setAnchorRect({ x, y, width: w, height: h });
                setOpen(true);
            });
            return;
        }

        setOpen(true);
    }

    function closePicker() {
        setOpen(false);
        setPickerView("days");
    }

    function handleConfirm() {
        commitDate(draftDate);
        closePicker();
    }

    function handleClear() {
        setDraftDate(null);
        commitDate(null);
        closePicker();
    }

    useEffect(() => {
        if (open && isFloatingMode && triggerRef.current) {
            (triggerRef.current as any).measureInWindow((x: number, y: number, w: number, h: number) => {
                setAnchorRect({ x, y, width: w, height: h });
            });
        }
    }, [open, isFloatingMode, width, height]);

    const displayText = selectedDate ? dateFormatter.format(selectedDate) : (props.placeholder ?? "Select date");

    // Month names for quick-pick grid
    const monthNames = useMemo(() => Array.from({ length: 12 }, (_, i) =>
        shortMonthFormatter.format(new Date(2024, i, 1))
    ), [shortMonthFormatter]);

    // Decade start for year grid (12-year block)
    const decadeStart = Math.floor(visibleMonth.getFullYear() / 12) * 12;

    const calendarPanel = (
        <>
            {/* Header */}
            <View style={styles.monthHeader}>
                <Pressable
                    style={styles.monthButton}
                    onPress={() => {
                        if (pickerView === "days") setVisibleMonth((cur) => addMonths(cur, -1));
                        else if (pickerView === "months") setVisibleMonth((cur) => new Date(cur.getFullYear() - 1, cur.getMonth(), 1));
                        else setVisibleMonth((cur) => new Date(cur.getFullYear() - 12, cur.getMonth(), 1));
                    }}
                >
                    <DBText style={styles.monthButtonText}>{"\u276E"}</DBText>
                </Pressable>

                {pickerView === "days" && (
                    <View style={{ flexDirection: "row", gap: 4 }}>
                        <Pressable
                            style={({ pressed }) => [styles.monthTitlePressable, pressed && styles.monthTitleActive]}
                            onPress={() => setPickerView("months")}
                        >
                            <DBText style={styles.monthTitle}>
                                {new Intl.DateTimeFormat(locale, { month: "long" }).format(visibleMonth)}
                            </DBText>
                            <DBText style={styles.headerChevron}>{"\u25BE"}</DBText>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.monthTitlePressable, pressed && styles.monthTitleActive]}
                            onPress={() => setPickerView("years")}
                        >
                            <DBText style={styles.monthTitleYear}>
                                {visibleMonth.getFullYear()}
                            </DBText>
                            <DBText style={styles.headerChevron}>{"\u25BE"}</DBText>
                        </Pressable>
                    </View>
                )}
                {pickerView === "months" && (
                    <Pressable
                        style={({ pressed }) => [styles.monthTitlePressable, pressed && styles.monthTitleActive]}
                        onPress={() => setPickerView("years")}
                    >
                        <DBText style={styles.monthTitle}>{visibleMonth.getFullYear()}</DBText>
                        <DBText style={styles.headerChevron}>{"\u25BE"}</DBText>
                    </Pressable>
                )}
                {pickerView === "years" && (
                    <DBText style={styles.monthTitle}>{decadeStart} {"\u2013"} {decadeStart + 11}</DBText>
                )}

                <Pressable
                    style={styles.monthButton}
                    onPress={() => {
                        if (pickerView === "days") setVisibleMonth((cur) => addMonths(cur, 1));
                        else if (pickerView === "months") setVisibleMonth((cur) => new Date(cur.getFullYear() + 1, cur.getMonth(), 1));
                        else setVisibleMonth((cur) => new Date(cur.getFullYear() + 12, cur.getMonth(), 1));
                    }}
                >
                    <DBText style={styles.monthButtonText}>{"\u276F"}</DBText>
                </Pressable>
            </View>

            {/* Month grid */}
            {pickerView === "months" && (
                <View style={styles.quickPickGrid}>
                    {monthNames.map((name, idx) => {
                        const isCurrent = idx === visibleMonth.getMonth();
                        const isThisMonth = idx === today.getMonth() && visibleMonth.getFullYear() === today.getFullYear();
                        return (
                            <View key={idx} style={styles.quickPickCell}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.quickPickButton,
                                        isCurrent && styles.quickPickButtonSelected,
                                        !isCurrent && isThisMonth && styles.quickPickButtonToday,
                                        pressed && !isCurrent && styles.quickPickButtonPressed,
                                    ]}
                                    onPress={() => {
                                        setVisibleMonth(new Date(visibleMonth.getFullYear(), idx, 1));
                                        setPickerView("days");
                                    }}
                                >
                                    <DBText style={[styles.quickPickText, isCurrent && styles.quickPickTextSelected]}>{name}</DBText>
                                </Pressable>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Year grid */}
            {pickerView === "years" && (
                <View style={styles.quickPickGrid}>
                    {Array.from({ length: 12 }, (_, i) => decadeStart + i).map((yr) => {
                        const isCurrent = yr === visibleMonth.getFullYear();
                        const isThisYear = yr === today.getFullYear();
                        return (
                            <View key={yr} style={styles.yearPickCell}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.quickPickButton,
                                        isCurrent && styles.quickPickButtonSelected,
                                        !isCurrent && isThisYear && styles.quickPickButtonToday,
                                        pressed && !isCurrent && styles.quickPickButtonPressed,
                                    ]}
                                    onPress={() => {
                                        setVisibleMonth(new Date(yr, visibleMonth.getMonth(), 1));
                                        setPickerView("months");
                                    }}
                                >
                                    <DBText style={[styles.quickPickText, isCurrent && styles.quickPickTextSelected]}>{yr}</DBText>
                                </Pressable>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Day grid */}
            {pickerView === "days" && (
                <>
                    <View style={styles.weekdaysRow}>
                        {weekdayLabels.map((label, index) => (
                            <DBText key={label + "-" + index} style={styles.weekday}>{label}</DBText>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {visibleDays.map((date) => {
                            const dayKey = toIsoDate(date);
                            const inMonth = date.getMonth() === visibleMonth.getMonth();
                            const selected = sameDay(date, draftDate);
                            const isToday = sameDay(date, today);
                            const disabled = isDateDisabled(date);

                            return (
                                <View key={dayKey} style={styles.dayCell}>
                                    <Pressable
                                        style={({ pressed }) => [
                                            styles.dayButton,
                                            !inMonth && styles.dayOutsideMonth,
                                            disabled && styles.dayDisabled,
                                            isToday && styles.dayToday,
                                            selected && styles.daySelected,
                                            pressed && !disabled && !selected && styles.dayPressed,
                                        ]}
                                        disabled={disabled}
                                        onPress={() => {
                                            if (isFloatingMode) {
                                                commitDate(date);
                                                closePicker();
                                            } else {
                                                setDraftDate(date);
                                            }
                                        }}
                                        accessibilityRole="button"
                                        accessibilityLabel={dateFormatter.format(date)}
                                        accessibilityState={{ disabled, selected }}
                                    >
                                        <DBText style={[styles.dayText, isToday && !selected && styles.dayTextToday, selected && styles.dayTextSelected]}>{date.getDate()}</DBText>
                                    </Pressable>
                                </View>
                            );
                        })}
                    </View>
                </>
            )}

            <View style={styles.footer}>
                <Pressable style={styles.footerButton} onPress={handleClear}>
                    <DBText style={styles.footerButtonTextClear}>{props.clearLabel ?? "Clear"}</DBText>
                </Pressable>
                {!isFloatingMode && (
                    <Pressable style={[styles.footerButton, styles.footerButtonBrand]} onPress={handleConfirm}>
                        <DBText style={[styles.footerButtonText, styles.footerButtonTextBrand]}>{props.confirmLabel ?? "Apply"}</DBText>
                    </Pressable>
                )}
            </View>
        </>
    );

    const floatingPanelStyle = useMemo(() => {
        const horizontalMargin = 8;
        const panelWidth = Math.max(
            sizeConfig.minWidth,
            Math.min(sizeConfig.maxWidth, Math.max(anchorRect.width, sizeConfig.baseWidth), width - horizontalMargin * 2),
        );
        const left = Math.max(horizontalMargin, Math.min(anchorRect.x, width - panelWidth - horizontalMargin));
        const gap = props.floatingGap ?? 4;
        const preferredTop = anchorRect.y + anchorRect.height + gap;
        const effectiveHeight = panelHeight > 0 ? panelHeight : Math.min(sizeConfig.maxHeight, height * 0.85);
        const top = preferredTop + effectiveHeight > height - horizontalMargin
            ? Math.max(horizontalMargin, anchorRect.y - effectiveHeight - gap)
            : preferredTop;
        return { width: panelWidth, left, top, maxHeight: sizeConfig.maxHeight };
    }, [anchorRect, width, height, sizeConfig, panelHeight, props.floatingGap]);

    return (
        <View style={styles.container} ref={component}>
            {props.label && (
                <DBText style={styles.label}>
                    {props.label}{props.required && <DBText style={styles.required}> *</DBText>}
                </DBText>
            )}

            <View ref={triggerRef}>
                <Pressable
                    style={({ pressed }) => [
                        styles.trigger,
                        Boolean(props.disabled) && styles.triggerDisabled,
                        open && styles.triggerFocused,
                        isInvalid && styles.triggerInvalid,
                        isValid && styles.triggerValid,
                        pressed && !props.disabled && { opacity: 0.9 },
                    ]}
                    onPress={() => {
                        if (open) {
                            closePicker();
                        } else {
                            openPicker();
                        }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={props.label ?? "Date picker"}
                    accessibilityState={{ disabled: Boolean(props.disabled), expanded: open }}
                >
                    <DBText style={[styles.triggerText, !selectedDate && styles.triggerPlaceholder]}>{displayText}</DBText>
                    <DBText style={styles.triggerIcon}>DATE</DBText>
                </Pressable>
            </View>

            <Modal
                visible={open}
                transparent={!isFullscreen || isFloatingMode}
                animationType={isFullscreen ? "slide" : "fade"}
                onRequestClose={closePicker}
            >
                {isFloatingMode ? (
                    <Pressable style={styles.floatingBackdrop} onPress={closePicker}>
                        <Pressable
                            style={[styles.floatingPanel, floatingPanelStyle]}
                            onPress={(event) => event.stopPropagation()}
                            onLayout={(e) => setPanelHeight(e.nativeEvent.layout.height)}
                        >
                            <View style={[styles.sheet, styles.floatingSheet]}>
                                {calendarPanel}
                            </View>
                        </Pressable>
                    </Pressable>
                ) : isFullscreen ? (
                    <View style={styles.fullscreenWrap}>
                        <Pressable style={[styles.sheet, styles.fullscreenSheet, { padding: DBSpacing.lg, gap: DBSpacing.md }]} onPress={(event) => event.stopPropagation()}>
                            {calendarPanel}
                        </Pressable>
                    </View>
                ) : (
                    <Pressable style={styles.modalBackdrop} onPress={closePicker}>
                        <Pressable
                            style={[styles.modalCard, { maxWidth: sizeConfig.maxWidth, maxHeight: sizeConfig.maxHeight }]}
                            onPress={(event) => event.stopPropagation()}
                        >
                            <View style={[styles.sheet, styles.modalSheet]}>
                                {calendarPanel}
                            </View>
                        </Pressable>
                    </Pressable>
                )}
            </Modal>

            {stringPropVisible(props.message, props.showMessage) && (
                <DBInfotext size="small" semantic="adaptive">{props.message}</DBInfotext>
            )}
            {isValid && <DBInfotext size="small" semantic="successful">{props.validMessage ?? DEFAULT_VALID_MESSAGE}</DBInfotext>}
            {isInvalid && <DBInfotext size="small" semantic="critical">{props.invalidMessage ?? DEFAULT_INVALID_MESSAGE}</DBInfotext>}
        </View>
    );
}

const DBDatepicker = forwardRef<View, DBDatepickerProps>(DBDatepickerFn);
export default DBDatepicker;
