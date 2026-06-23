import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  DBCustomSelect,
  DBSelect,
  DBDivider,
  DBBadge,
  DBText,
} from "@db-ux/react-native-core-components";
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

const TRAIN_CLASSES = [
  { value: "ice", label: "ICE — Intercity-Express" },
  { value: "ic", label: "IC — Intercity" },
  { value: "re", label: "RE — Regional-Express" },
  { value: "rb", label: "RB — Regionalbahn" },
  { value: "s", label: "S-Bahn" },
  { value: "u", label: "U-Bahn" },
  { value: "tram", label: "Tram / Straßenbahn" },
  { value: "bus", label: "Bus" },
];

const CITIES = [
  { value: "berlin", label: "Berlin Hbf" },
  { value: "hamburg", label: "Hamburg Hbf" },
  { value: "munich", label: "München Hbf" },
  { value: "cologne", label: "Köln Hbf" },
  { value: "frankfurt", label: "Frankfurt (Main) Hbf" },
  { value: "stuttgart", label: "Stuttgart Hbf" },
  { value: "dusseldorf", label: "Düsseldorf Hbf" },
  { value: "leipzig", label: "Leipzig Hbf" },
];

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function SelectShowcase() {
  const c = useScreenColors();
  // Separate states so each section is independent
  const [trainClassSheet, setTrainClassSheet] = useState("");
  const [trainClassDropdown, setTrainClassDropdown] = useState("");
  const [trainClassFullscreen, setTrainClassFullscreen] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [months, setMonths] = useState<string[]>([]);
  const [radioCity, setRadioCity] = useState("");
  const [nativeMonth, setNativeMonth] = useState("");

  function handleOriginChange(v: any) {
    const val = Array.isArray(v) ? v[0] ?? "" : String(v);
    setOrigin(val);
    if (val && val === destination) setDestination("");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DBText style={[styles.heading, { color: c.heading }]}>Select & Picker</DBText>

      <Section title="DBCustomSelect — single value (bottom sheet)">
        <DBCustomSelect
          label="Train class"
          placeholder="Choose a train type…"
          options={TRAIN_CLASSES}
          values={trainClassSheet}
          onOptionSelected={(v: any) => setTrainClassSheet(Array.isArray(v) ? v[0] ?? "" : String(v))}
        />
        {trainClassSheet ? (
          <View style={styles.result}>
            <DBText variant="label" style={{ color: c.muted }}>Selected: </DBText>
            <DBBadge semantic="informational">{TRAIN_CLASSES.find((t) => t.value === trainClassSheet)?.label ?? trainClassSheet}</DBBadge>
          </View>
        ) : null}
      </Section>

      <Section title="DBCustomSelect — multi-select">
        <DBCustomSelect
          label="Travel months"
          placeholder="Pick one or more months…"
          options={MONTHS}
          multiple
          values={months}
          onOptionSelected={(v: any) => setMonths(Array.isArray(v) ? v : String(v).split(",").filter(Boolean))}
        />
        {months.length > 0 ? (
          <View style={[styles.result, { flexWrap: "wrap" }]}>
            {months.map((m) => (
              <DBBadge key={m} semantic="successful">{MONTHS.find((x) => x.value === m)?.label ?? m}</DBBadge>
            ))}
          </View>
        ) : null}
      </Section>

      <DBDivider />

      <Section title="DBCustomSelect — origin / destination pair">
        <DBCustomSelect
          label="From"
          placeholder="Departure city…"
          options={CITIES}
          values={origin}
          onOptionSelected={handleOriginChange}
        />
        <DBCustomSelect
          label="To"
          placeholder="Arrival city…"
          options={CITIES.filter((city) => city.value !== origin)}
          values={destination}
          onOptionSelected={(v: any) => setDestination(Array.isArray(v) ? v[0] ?? "" : String(v))}
        />
        {origin && destination && (
          <View style={[styles.result, { gap: 6 }]}>
            <DBText variant="body" style={{ color: c.body }}>
              {CITIES.find((city) => city.value === origin)?.label}
              {" → "}
              {CITIES.find((city) => city.value === destination)?.label}
            </DBText>
          </View>
        )}
      </Section>

      <DBDivider />

      <Section title="DBSelect — native/web dropdown (forced)">
        <DBSelect
          label="Month (forced dropdown)"
          placeholder="Select a month…"
          options={MONTHS.map((m) => m.label)}
          value={nativeMonth}
          forceDropdown
          onChange={(v: any) => setNativeMonth(String(v))}
        />
      </Section>

      <Section title="DBSelect — fullscreen picker (forced)">
        <DBSelect
          label="Month (forced fullscreen)"
          placeholder="Select a month…"
          options={MONTHS.map((m) => m.label)}
          value={nativeMonth}
          forceFullscreen
          onChange={(v: any) => setNativeMonth(String(v))}
        />
      </Section>

      <Section title="DBCustomSelect — dropdown (forced, e.g. for web)">
        <DBCustomSelect
          label="Train class (forced dropdown)"
          placeholder="Choose a train type…"
          options={TRAIN_CLASSES}
          values={trainClassDropdown}
          forceDropdown
          onOptionSelected={(v: any) => setTrainClassDropdown(Array.isArray(v) ? v[0] ?? "" : String(v))}
        />
      </Section>

      <Section title="DBCustomSelect — fullscreen (forced)">
        <DBCustomSelect
          label="Train class (forced fullscreen)"
          placeholder="Choose a train type…"
          options={TRAIN_CLASSES}
          values={trainClassFullscreen}
          forceFullscreen
          onOptionSelected={(v: any) => setTrainClassFullscreen(Array.isArray(v) ? v[0] ?? "" : String(v))}
        />
      </Section>

      <Section title="DBCustomSelect — radio fullscreen (single, forced)">
        <DBCustomSelect
          label="Departure city"
          placeholder="Choose a city…"
          options={CITIES}
          values={radioCity}
          forceFullscreen
          onOptionSelected={(v: any) => setRadioCity(Array.isArray(v) ? v[0] ?? "" : String(v))}
        />
        {radioCity ? (
          <View style={styles.result}>
            <DBText variant="label" style={{ color: c.muted }}>Selected: </DBText>
            <DBBadge semantic="informational">{CITIES.find((city) => city.value === radioCity)?.label ?? radioCity}</DBBadge>
          </View>
        ) : null}
      </Section>

      <Section title="DBCustomSelect — disabled">
        <DBCustomSelect
          label="Disabled field"
          placeholder="Cannot be changed"
          options={TRAIN_CLASSES}
          disabled
        />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  result: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" },
});
