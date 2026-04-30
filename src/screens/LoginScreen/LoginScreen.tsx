import AppText from '@components/AppText/AppText';
import PrimaryButton from '@components/PrimaryButton';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import { useAuthStore } from '@providers/AuthProvider';
import { colors, radius, spacing, shadows } from '@theme/tokens';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const LoginScreen = () => {
	const login = useAuthStore((s) => s.login);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleLogin = useCallback(async () => {
		if (isSubmitting) {
			return;
		}

		setErrorMessage(null);
		setIsSubmitting(true);

		try {
			await login();
		} catch (error) {
			console.error('[LoginScreen] Login failed:', error);
			setErrorMessage(
				'Unable to log in right now. Check Auth0 config and try again.',
			);
		} finally {
			setIsSubmitting(false);
		}
	}, [isSubmitting, login]);

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
					{errorMessage ? (
						<AppText style={styles.errorText}>
							{errorMessage}
						</AppText>
					) : null}
					<PrimaryButton
						title={isSubmitting ? 'Logging in...' : 'Login'}
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
	errorText: {
		color: colors.error,
		marginBottom: spacing.sm,
	},
	text: {
		fontSize: 18,
		marginBottom: spacing.xl,
	},
});

export default LoginScreen;
