import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import { AppColors, radius, spacing, typography } from '@theme/tokens';
import { formatIntlCurrencyDisplay } from '@utils/moneyUtils';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type BalanceHeaderProps = {
	balance: number;
	isLoading?: boolean;
	variant?: 'card' | 'plain';
};

/**
 * Minimal, sleek balance header component.
 * Displays total balance with color coding (green for positive, red for negative).
 */
const BalanceHeader = ({
	balance,
	isLoading = false,
	variant = 'card',
}: BalanceHeaderProps) => {
	const { colors } = useTheme();
	const styles = React.useMemo(() => createStyles(colors), [colors]);
	const isPositive = balance >= 0;
	const balanceColor = isPositive ? colors.success : colors.error;

	const formattedBalance = formatIntlCurrencyDisplay(balance);

	return (
		<View
			style={[
				styles.base,
				variant === 'card'
					? styles.cardContainer
					: styles.plainContainer,
			]}>
			<AppText style={styles.label}>Total Balance</AppText>
			<AppText
				variant="heroTitle"
				numberOfLines={1}
				ellipsizeMode="tail"
				style={[styles.balance, { color: balanceColor }]}>
				{isLoading || formattedBalance}
			</AppText>
		</View>
	);
};

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		base: {
			alignItems: 'center',
			gap: spacing.sm,
		},
		cardContainer: {
			paddingHorizontal: spacing.lg,
			paddingVertical: spacing.md,
			backgroundColor: colors.neutral.surface,
			borderRadius: radius.lg,
		},
		plainContainer: {
			paddingHorizontal: 0,
			paddingVertical: 0,
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
