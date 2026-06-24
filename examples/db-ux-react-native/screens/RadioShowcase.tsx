import { DBRadio, DBText } from '@db-ux/react-native-core-components';
import React, { useState } from 'react';
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
			<DBText style={[styles.sectionTitle, { color: c.muted }]}>
				{title}
			</DBText>
			{children}
		</View>
	);
}

const data = [
	{
		label: 'Foo',
		value: 'Foo',
		disabled: false
	},
	{
		label: 'Bar',
		value: 'Bar',
		disabled: false
	},
	{
		label: 'Baz',
		value: 'Baz',
		disabled: false
	}
];

export default function RadioShowcase() {
	const c = useScreenColors();
	const [checked, setChecked] = useState('');

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<DBText style={[styles.heading, { color: c.heading }]}>
				DBRadio
			</DBText>

			<Section title="Basic">
				<DBRadio label="Basic" value="Basic" />
			</Section>

			<Section title="Disabled">
				<DBRadio label="disabled" value="disabled" disabled />
			</Section>

			<Section title="Group">
				<fieldset
					style={{
						border: 'none',
						padding: 0,
						marginInline: 0
					}}>
					<legend
						style={{
							marginBottom: '6px'
						}}>
						<DBText weight="bold">FooBar</DBText>
					</legend>
					<div
						style={{
							width: '100%',
							display: 'flex',
							flexDirection: 'row',
							gap: 8
						}}>
						{data.map(({ disabled, label, value }) => (
							<div key={value}>
								<DBRadio
									disabled={disabled}
									label={label}
									value={value}
									checked={checked === value}
									onChange={(_, value) => {
										setChecked(value);
									}}
									name={label}
								/>
							</div>
						))}
					</div>
				</fieldset>
			</Section>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 20,
		gap: 8
	},
	heading: {
		fontSize: 24,
		fontWeight: '700',
		marginBottom: 8
	},
	section: {
		marginBottom: 16,
		gap: 8
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: '600',
		marginBottom: 4,
		textTransform: 'uppercase',
		letterSpacing: 0.5
	}
});
