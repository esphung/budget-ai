import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import { StyleSheet, View } from 'react-native';
import { AppColors, radius, spacing } from '@theme/tokens';

const LoadingView = ({ message }: { message: string }) => {
	const { colors } = useTheme();
	const styles = createStyles(colors);

	return (
		<View style={styles.container}>
			<View style={styles.badge}>
				<AppText style={styles.message}>{message}</AppText>
			</View>
		</View>
	);
};

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
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
