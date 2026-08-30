import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function Splash() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>DesigParts</Text>
			<ActivityIndicator size="large" color="#6C63FF" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff'
	},
	title: {
		fontSize: 28,
		fontWeight: '700',
		marginBottom: 20,
		color: '#333'
	}
});
