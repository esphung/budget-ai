import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import { AppColors, radius, spacing, typography } from '@theme/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type BalanceHeaderProps = {
	balance: number;
	isLoading?: boolean;
};

/**
 * Minimal, sleek balance header component.
 * Displays total balance with color coding (green for positive, red for negative).
 */
const BalanceHeader = ({
	balance,
	isLoading = false,
}: BalanceHeaderProps) => {
	const { colors } = useTheme();
	const styles = React.useMemo(() => createStyles(colors), [colors]);
	const isPositive = balance >= 0;
	const balanceColor = isPositive ? colors.success : colors.error;

	const formattedBalance = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(balance);

	return (
		<View style={styles.container}>
			<AppText style={styles.label}>Total Balance</AppText>
			<AppText
				variant="heroTitle"
				style={[
					styles.balance,
					{
						color: balanceColor,
					},
				]}>
				{isLoading ? '—' : formattedBalance}
			</AppText>
		</View>
	);
};

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		container: {
			paddingHorizontal: spacing.lg,
			paddingVertical: spacing.md,
			backgroundColor: colors.neutral.surface,
			borderRadius: radius.lg,
			alignItems: 'center',
			gap: spacing.sm,
		},
		label: {
			...typography.eyebrow,
			textTransform: 'uppercase',
			letterSpacing: 0.8,
			color: colors.neutral.textTertiary,
		},
		balance: {
			fontWeight: '700',
		},
	});

export default BalanceHeader;
