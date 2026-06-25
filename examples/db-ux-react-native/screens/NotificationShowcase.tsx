import {
  DBButton,
  DBDivider,
  DBNotification,
  DBText,
  type SemanticType
} from '@db-ux/react-native-core-components';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useScreenColors } from './theme';

type NotificationItem = {
	id: string;
	semantic: SemanticType;
	headline: string;
	text: string;
};

const notificationTemplates: {
	label: string;
	semantic: SemanticType;
	headline: string;
	text: string;
}[] = [
	{
		label: 'Adaptive',
		semantic: 'adaptive',
		headline: 'Adaptive Notification',
		text: 'This is an adaptive notification.'
	},
	{
		label: 'Critical',
		semantic: 'critical',
		headline: 'Critical Error',
		text: 'A critical error has occurred.'
	},
	{
		label: 'Informational',
		semantic: 'informational',
		headline: 'Information',
		text: 'Here is some useful information.'
	},
	{
		label: 'Neutral',
		semantic: 'neutral',
		headline: 'Neutral Notification',
		text: 'A neutral notification message.'
	},
	{
		label: 'Successful',
		semantic: 'successful',
		headline: 'Success',
		text: 'Operation completed successfully.'
	},
	{
		label: 'Warning',
		semantic: 'warning',
		headline: 'Warning',
		text: 'Please review this warning.'
	}
];

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
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);

	const pushNotification = (template: (typeof notificationTemplates)[0]) => {
		const id = crypto.randomUUID();
		setNotifications((prev) => [...prev, { ...template, id }]);
	};

	const removeNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<DBText style={[styles.heading, { color: c.heading }]}>
				DBNotification
			</DBText>

			<Section title="Semantic">
				{notificationTemplates.map((template) => (
					<DBButton
						key={template.semantic}
						onClick={() => pushNotification(template)}>
						{template.label || template.semantic}
					</DBButton>
				))}
			</Section>

			<DBDivider />

			<Section title="Active Notifications">
				{notifications.map((notification) => (
					<View key={notification.id} style={styles.notificationRow}>
						<DBNotification
							semantic={notification.semantic}
							variant="overlay"
							headline={notification.headline}
							text={notification.text}
							closeable
							onClose={() => removeNotification(notification.id)}
						/>
					</View>
				))}
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
		marginBottom: 4
	},
	notificationRow: { width: '100%', marginBottom: 8 }
});
