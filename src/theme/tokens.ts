/**
 * Centralized design tokens for BudgetAI
 * All colors, spacing, typography, and shadows are defined here
 * to ensure consistency across the app
 */

export const colors = {
	// Primary
	primary: {
		base: '#0B5FFF',
		light: '#3B82F6',
		dark: '#0047CC',
	},

	// Neutral
	neutral: {
		background: '#F3F6FB',
		surface: '#FFFFFF',
		border: '#CBD5E1',
		borderLight: '#E2E8F0',
		text: '#0F172A',
		textSecondary: '#475569',
		textTertiary: '#64748B',
		placeholder: '#94A3B8',
		disabled: '#CBD5E1',
	},

	// Semantic
	success: '#15803D',
	error: '#B91C1C',
	warning: '#C2410C',
	info: '#0047CC',

	// Chat
	chat: {
		user: '#0B5FFF',
		assistant: '#E2E8F0',
		userText: '#FFFFFF',
		assistantText: '#0F172A',
	},

	// UI State
	loading: '#EEF2FF',
	insight: '#FFF7ED',
	insightBorder: '#FDBA74',
};

export const spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	xxl: 24,
	xxxl: 28,
};

export const radius = {
	sm: 8,
	md: 14,
	lg: 16,
	xl: 20,
	xxl: 22,
	full: 999,
};

export const typography = {
	eyebrow: {
		fontSize: 12,
		fontWeight: '700' as const,
		letterSpacing: 1,
	},
	small: {
		fontSize: 13,
		fontWeight: '600' as const,
	},
	body: {
		fontSize: 14,
		fontWeight: '500' as const,
		lineHeight: 20,
	},
	bodyMedium: {
		fontSize: 15,
		fontWeight: '500' as const,
		lineHeight: 21,
	},
	subtitle: {
		fontSize: 16,
		fontWeight: '500' as const,
		lineHeight: 22,
	},
	title: {
		fontSize: 28,
		fontWeight: '800' as const,
	},
	titleLarge: {
		fontSize: 30,
		fontWeight: '700' as const,
	},
	heroTitle: {
		fontSize: 34,
		fontWeight: '800' as const,
	},
};

export const shadows = {
	sm: {
		shadowColor: colors.neutral.text,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	md: {
		shadowColor: colors.neutral.text,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.07,
		shadowRadius: 14,
		elevation: 3,
	},
	lg: {
		shadowColor: colors.neutral.text,
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.07,
		shadowRadius: 18,
		elevation: 4,
	},
	xl: {
		shadowColor: colors.neutral.text,
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.08,
		shadowRadius: 20,
		elevation: 5,
	},
};
