import AppText from '@components/AppText/AppText';
import PrimaryButton from '@components/PrimaryButton';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import { useAuthStore } from '@providers/AuthProvider';
import { colors, radius, spacing, shadows } from '@theme/tokens';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

const LoginScreen = () => {
	const setToken = useAuthStore((s) => s.setToken);

	const handleLogin = useMemo(() => {
		return () => {
			setToken('authenticated');
		};
	}, [setToken]);

	return (
		<ThemedScreen>
			<View style={styles.content} testID={TestID.LoginScreen}>
				<View style={styles.card}>
					<AppText variant="eyebrow" style={styles.eyebrow}>
						Welcome
					</AppText>
					<AppText variant="heroTitle" style={styles.title}>
						BudgetAI
					</AppText>
					<AppText variant="subtitle" style={styles.subtitle}>
						Welcome to BudgetAI!
					</AppText>
					<PrimaryButton
						title="Login"
						onPress={handleLogin}
						width="100%"
					/>
				</View>
			</View>
		</ThemedScreen>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: spacing.xl,
	},
	card: {
		width: '100%',
		maxWidth: 420,
		backgroundColor: colors.neutral.surface,
		borderRadius: radius.xxl,
		paddingVertical: spacing.xxxl,
		paddingHorizontal: spacing.xxl + 2,
		...shadows.xl,
		gap: spacing.md - 2,
	},
	eyebrow: {
		textTransform: 'uppercase',
		letterSpacing: 1.2,
		color: colors.neutral.textTertiary,
	},
	title: {
		color: colors.neutral.text,
	},
	subtitle: {
		color: colors.neutral.textSecondary,
		marginBottom: spacing.sm,
	},
	text: {
		fontSize: 18,
		marginBottom: spacing.xl,
	},
});

export default LoginScreen;
