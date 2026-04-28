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
			paddingVertical: 8,
			paddingHorizontal: 8,
			fontSize: 14,
			color: colors.neutral.text,
		},
		tableCellWide: {
			flex: 1,
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
		expandedDetails: {
			borderTopWidth: 1,
			borderTopColor: colors.neutral.borderLight,
			backgroundColor: colors.neutral.background,
			paddingVertical: 8,
			paddingHorizontal: 14,
			borderWidth: 1,
		},
		detailRow: {
			flexDirection: 'row',
		},
		detailLabel: {
			fontSize: 12,
			color: colors.neutral.textSecondary,
			width: 72,
		},
		detailValue: {
			fontSize: 12,
			color: colors.neutral.text,
			flex: 1,
			textAlign: 'right',
		},
	});
