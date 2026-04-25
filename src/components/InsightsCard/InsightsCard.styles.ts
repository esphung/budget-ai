import { StyleSheet } from 'react-native';
import { type InsightSeverity, type InsightType } from '@models/Insight';

/** Background and border colours keyed by severity. */
export const severityColors: Record<
	InsightSeverity,
	{ background: string; border: string; title: string }
> = {
	info: {
		background: '#e3f2fd',
		border: '#1976d2',
		title: '#0d47a1',
	},
	warning: {
		background: '#fff8e1',
		border: '#f9a825',
		title: '#e65100',
	},
	positive: {
		background: '#e8f5e9',
		border: '#2e7d32',
		title: '#1b5e20',
	},
};

/** Emoji prefix keyed by insight type for quick visual scanning. */
export const typeEmoji: Record<InsightType, string> = {
	spending: '💸',
	saving: '💰',
	income: '📈',
	recurring: '🔄',
	alert: '⚠️',
};

export default StyleSheet.create({
	card: {
		width: '100%',
		borderWidth: 1,
		borderRadius: 8,
		padding: 14,
		gap: 6,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	emoji: {
		fontSize: 16,
	},
	title: {
		fontSize: 14,
		fontWeight: '700',
		flexShrink: 1,
	},
	body: {
		fontSize: 14,
		lineHeight: 20,
		color: '#333',
	},
});
