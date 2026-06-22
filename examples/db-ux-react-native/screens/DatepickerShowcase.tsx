import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { DBButton, DBDatepicker, DBDivider, DBText } from "@db-ux/react-native-core-components";
import { useScreenColors } from "./theme";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    const c = useScreenColors();
    return (
        <View style={styles.section}>
            <DBText style={[styles.sectionTitle, { color: c.muted }]}>{title}</DBText>
            {children}
        </View>
    );
}

function toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function DatepickerShowcase() {
    const c = useScreenColors();
    const [travelDate, setTravelDate] = useState("");
    const [returnDate, setReturnDate] = useState("");
    const [floatingDate, setFloatingDate] = useState("");
    const [gapDate0, setGapDate0] = useState("");
    const [gapDate4, setGapDate4] = useState("");
    const [gapDate12, setGapDate12] = useState("");
    const [sizeSDate, setSizeSDate] = useState("");
    const [sizeMDate, setSizeMDate] = useState("");
    const [sizeLDate, setSizeLDate] = useState("");
    const [sizeXLDate, setSizeXLDate] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const today = useMemo(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }, []);

    const maxBookingDate = useMemo(() => {
        return new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
    }, [today]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <DBText style={[styles.heading, { color: c.heading }]}>Datepicker</DBText>

            <Section title="Basic">
                <DBDatepicker
                    label="Departure date"
                    value={travelDate}
                    placeholder="Choose departure"
                    onChange={(e) => setTravelDate(e?.target?.value ?? "")}
                />
            </Section>

            <Section title="With Min / Max Range">
                <DBDatepicker
                    label="Return date"
                    value={returnDate}
                    min={today}
                    max={maxBookingDate}
                    placeholder="Choose return"
                    onChange={(e) => setReturnDate(e?.target?.value ?? "")}
                    message="Booking window: today until six months from now"
                    showMessage
                />
            </Section>

            <Section title="Floating (web/tablet)">
                <DBDatepicker
                    label="Floating picker"
                    value={floatingDate}
                    presentation="floating"
                    placeholder="Open near field"
                    onChange={(e) => setFloatingDate(e?.target?.value ?? "")}
                />
            </Section>

            <Section title="Floating Gap">
                <DBDatepicker
                    label="No gap (0)"
                    value={gapDate0}
                    presentation="floating"
                    floatingGap={0}
                    placeholder="floatingGap={0}"
                    onChange={(e) => setGapDate0(e?.target?.value ?? "")}
                />
                <DBDatepicker
                    label="Default gap (4)"
                    value={gapDate4}
                    presentation="floating"
                    floatingGap={4}
                    placeholder="floatingGap={4}"
                    onChange={(e) => setGapDate4(e?.target?.value ?? "")}
                />
                <DBDatepicker
                    label="Large gap (12)"
                    value={gapDate12}
                    presentation="floating"
                    floatingGap={12}
                    placeholder="floatingGap={12}"
                    onChange={(e) => setGapDate12(e?.target?.value ?? "")}
                />
            </Section>

            <Section title="Sizes (s, m, l, xl)">
                <DBDatepicker
                    label="Small"
                    value={sizeSDate}
                    size="s"
                    presentation="floating"
                    placeholder="Size s"
                    onChange={(e) => setSizeSDate(e?.target?.value ?? "")}
                />
                <DBDatepicker
                    label="Medium"
                    value={sizeMDate}
                    size="m"
                    presentation="floating"
                    placeholder="Size m"
                    onChange={(e) => setSizeMDate(e?.target?.value ?? "")}
                />
                <DBDatepicker
                    label="Large"
                    value={sizeLDate}
                    size="l"
                    presentation="floating"
                    placeholder="Size l"
                    onChange={(e) => setSizeLDate(e?.target?.value ?? "")}
                />
                <DBDatepicker
                    label="Extra large"
                    value={sizeXLDate}
                    size="xl"
                    presentation="floating"
                    placeholder="Size xl"
                    onChange={(e) => setSizeXLDate(e?.target?.value ?? "")}
                />
            </Section>

            <DBDivider />

            <Section title="Validation State">
                <DBDatepicker
                    label="Travel date (required)"
                    value={travelDate}
                    min={today}
                    validation={submitted && !travelDate ? "invalid" : travelDate ? "valid" : undefined}
                    validMessage="Date selected"
                    invalidMessage="Please choose your departure date"
                    onChange={(e) => setTravelDate(e?.target?.value ?? "")}
                    required
                />

                <View style={styles.resultRow}>
                    <DBText variant="label" style={{ color: c.muted }}>Selected values:</DBText>
                    <DBText style={{ color: c.body }}>Departure: {travelDate || "none"}</DBText>
                    <DBText style={{ color: c.body }}>Return: {returnDate || "none"}</DBText>
                </View>
            </Section>

            <Section title="Preset Value">
                <DBDatepicker
                    label="Preset"
                    value={toIsoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7))}
                    disabled
                />
            </Section>

            <View style={styles.submitRow}>
                <DBButton variant="brand" onClick={() => setSubmitted(true)}>
                    Validate Required Field
                </DBButton>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    resultRow: {
        marginTop: 10,
        gap: 2,
    },
    submitRow: {
        marginTop: 8,
        marginBottom: 8,
    },
});
