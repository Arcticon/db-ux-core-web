import {
  DBDivider,
  DBNotification,
  DBText
} from '@db-ux/react-native-core-components';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useScreenColors } from './theme';

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  const c = useScreenColors();
  return (
    <View style={styles.section}>
      <DBText style={[styles.sectionTitle, { color: c.subtle }]}>
        {title}
      </DBText>
      {children}
    </View>
  );
}

export default function NotificationShowcase() {
  const c = useScreenColors();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DBText style={[styles.heading, { color: c.heading }]}>
        DBNotification
      </DBText>

      <Section title="Semantic">
        <DBNotification semantic="adaptive">
          adaptive
        </DBNotification>
        <DBNotification semantic="critical">
          critical
        </DBNotification>
        <DBNotification semantic="informational">
          informational
        </DBNotification>
        <DBNotification semantic="neutral">
          neutral
        </DBNotification>
        <DBNotification semantic="successful">
          successful
        </DBNotification>
        <DBNotification semantic="warning">
          warning
        </DBNotification>
      </Section>

      <DBDivider />

      <Section title="Closeable">
        <DBNotification closeable>
          closeable
        </DBNotification>
      </Section>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  container: { padding: 16, gap: 24 },
  section: { gap: 12, alignSelf: 'flex-start' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bodyText: { fontSize: 14, lineHeight: 22 }
});
