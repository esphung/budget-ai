import { StyleSheet } from 'react-native';
import { AppColors, radius, shadows } from '@theme/tokens';

export const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		tableContainer: {
			width: '100%',
			borderWidth: 1,
			borderColor: colors.neutral.borderLight,
			borderRadius: radius.lg,
			backgroundColor: colors.neutral.surface,
			overflow: 'hidden',
			...shadows.sm,
		},
		tableTitle: {
			fontSize: 14,
			fontWeight: '700',
			paddingVertical: 12,
			paddingHorizontal: 14,
			backgroundColor: colors.neutral.background,
			color: colors.neutral.text,
			textTransform: 'uppercase',
			letterSpacing: 0.7,
		},
		tableRow: {
			flexDirection: 'row',
			borderTopWidth: 1,
			borderTopColor: colors.neutral.borderLight,
		},
		tableCell: {
			flex: 1,
			paddingVertical: 10,
			paddingHorizontal: 8,
			fontSize: 13,
			color: colors.neutral.text,
		},
		tableCellWide: {
			flex: 1.4,
		},
		tableHeader: {
			fontWeight: '700',
			backgroundColor: colors.neutral.background,
			color: colors.neutral.textSecondary,
		},
		rowsScroll: {
			maxHeight: 320,
		},
		rowsScrollContent: {
			paddingBottom: 2,
		},
		amountNegative: {
			color: colors.error,
			fontWeight: '700',
		},
		amountPositive: {
			color: colors.success,
			fontWeight: '700',
		},
	});
