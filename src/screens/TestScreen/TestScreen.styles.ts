import { StyleSheet } from 'react-native';
import {
	AppColors,
	radius,
	spacing,
	shadows,
	typography,
} from '@theme/tokens';

export const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			alignItems: 'center',
		},
		scrollContent: {
			width: '100%',
			maxWidth: 480,
			alignSelf: 'center',
			alignItems: 'stretch',
			gap: spacing.md,
			paddingHorizontal: spacing.lg,
			paddingTop: spacing.lg,
			paddingBottom: spacing.lg,
		},
		heroCard: {
			backgroundColor: colors.neutral.surface,
			borderRadius: radius.lg,
			paddingHorizontal: spacing.lg,
			paddingVertical: spacing.xl,
			gap: spacing.sm,
			...shadows.md,
		},
		eyebrow: {
			...typography.eyebrow,
			textTransform: 'uppercase',
			color: colors.neutral.textTertiary,
		},
		heroTitle: {
			fontSize: 28,
			fontWeight: '800',
			color: colors.neutral.text,
		},
		heroSubtitle: {
			...typography.bodyMedium,
			color: colors.neutral.textSecondary,
			marginBottom: spacing.sm,
		},
		content: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			gap: 20,
			paddingHorizontal: 20,
		},
		tableContainer: {
			width: '100%',
			borderWidth: 1,
			borderColor: '#ddd',
			borderRadius: 6,
			overflow: 'hidden',
		},
		tableTitle: {
			fontSize: 16,
			fontWeight: '600',
			padding: 10,
			backgroundColor: '#f0f0f0',
		},
		tableRow: {
			flexDirection: 'row',
			borderTopWidth: 1,
			borderTopColor: '#ddd',
		},
		tableCell: {
			flex: 1,
			padding: 8,
			fontSize: 12,
		},
		tableCellWide: {
			flex: 1,
		},
		tableHeader: {
			fontWeight: '600',
			backgroundColor: '#f8f8f8',
		},
		amountNegative: {
			color: '#d32f2f',
		},
		amountPositive: {
			color: '#2e7d32',
		},
		insightCard: {
			width: '100%',
			backgroundColor: colors.insight,
			borderWidth: 1,
			borderColor: colors.insightBorder,
			borderRadius: radius.lg,
			padding: spacing.lg,
			gap: spacing.md - 6,
		},
		insightTitle: {
			fontSize: 13,
			fontWeight: '700',
			textTransform: 'uppercase',
			letterSpacing: 0.8,
			color: colors.warning,
		},
		insightText: {
			fontSize: 14,
			lineHeight: 20,
			color: colors.warning,
		},
		text: {
			fontSize: 18,
			marginBottom: 20,
		},
		button: {
			padding: 10,
			backgroundColor: '#007AFF',
			borderRadius: 5,
			width: 150,
			alignItems: 'center',
		},
		buttonText: {
			color: '#fff',
			fontSize: 16,
		},
		bottomSpacer: {
			height: 50,
		},
		buttonDisabled: {
			backgroundColor: '#ccc',
		},
		buttonContainer: {
			flexDirection: 'row',
			gap: 20,
		},
		linkTokenText: {
			fontSize: 12,
			color: '#555',
		},
	});
