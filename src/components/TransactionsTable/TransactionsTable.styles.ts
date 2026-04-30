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
		sectionHeader: {
			paddingHorizontal: 14,
			paddingVertical: 10,
			backgroundColor: colors.neutral.background,
			borderTopWidth: 1,
			borderTopColor: colors.neutral.borderLight,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		sectionHeaderLeft: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
		},
		sectionHeaderTitle: {
			fontSize: 13,
			fontWeight: '700',
			color: colors.neutral.text,
		},
		sectionHeaderCount: {
			fontSize: 11,
			fontWeight: '600',
			color: colors.neutral.textTertiary,
			textTransform: 'uppercase',
			letterSpacing: 0.3,
		},
		dailyNetBadge: {
			paddingHorizontal: 10,
			paddingVertical: 5,
			borderRadius: radius.full,
			borderWidth: 1,
		},
		dailyNetBadgePositive: {
			backgroundColor: 'rgba(0,180,90,0.08)',
			borderColor: 'rgba(0,180,90,0.22)',
		},
		dailyNetBadgeNegative: {
			backgroundColor: 'rgba(219,68,55,0.08)',
			borderColor: 'rgba(219,68,55,0.22)',
		},
		dailyNetText: {
			fontSize: 11,
			fontWeight: '700',
			letterSpacing: 0.2,
		},
		dailyNetTextPositive: {
			color: colors.success,
		},
		dailyNetTextNegative: {
			color: colors.error,
		},
		rowsScroll: {
			maxHeight: 420,
		},
		rowsScrollContent: {
			paddingBottom: 28,
		},
	});
