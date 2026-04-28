import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@theme/tokens';

const LoadingView = ({ message }: { message: string }) => (
	<View style={styles.container}>
		<View style={styles.badge}>
			<Text style={styles.message}>{message}</Text>
		</View>
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	badge: {
		backgroundColor: colors.loading,
		borderRadius: radius.full,
		paddingHorizontal: spacing.md + 2,
		paddingVertical: spacing.sm,
	},
	message: {
		color: colors.neutral.textTertiary,
		fontWeight: '600',
	},
});

export default LoadingView;
