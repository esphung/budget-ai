/**
 * Centralized design tokens for BudgetAI
 * All colors, spacing, typography, and shadows are defined here
 * to ensure consistency across the app
 */

export const lightColors = {
	// Primary
	primary: {
		base: '#2D72FF',
		light: '#60A5FA',
		dark: '#1A5CE6',
	},

	// Neutral
	neutral: {
		background: '#F8FAFF',
		surface: '#FFFFFF',
		border: '#DDE4F0',
		borderLight: '#EDF1F9',
		text: '#1A2540',
		textSecondary: '#5B6B87',
		textTertiary: '#7A8CA3',
		placeholder: '#A8B5C8',
		disabled: '#DDE4F0',
	},

	// Semantic
	success: '#1A9E50',
	error: '#E02D2D',
	warning: '#D4580A',
	info: '#1A5CE6',

	// Chat
	chat: {
		user: '#2D72FF',
		assistant: '#EDF1F9',
		userText: '#FFFFFF',
		assistantText: '#1A2540',
	},

	// UI State
	loading: '#F0F4FF',
	insight: '#FFFBF5',
	insightBorder: '#FEC97A',
};

export const darkColors = {
	// Primary
	primary: {
		base: '#3B82F6',
		light: '#60A5FA',
		dark: '#1D4ED8',
	},

	// Neutral
	neutral: {
		background: '#0B1220',
		surface: '#111A2D',
		border: '#2A354B',
		borderLight: '#34425C',
		text: '#E5EAF4',
		textSecondary: '#A8B3C7',
		textTertiary: '#8593AA',
		placeholder: '#6B7890',
		disabled: '#3B465A',
	},

	// Semantic
	success: '#22C55E',
	error: '#F87171',
	warning: '#FB923C',
	info: '#60A5FA',

	// Chat
	chat: {
		user: '#1D4ED8',
		assistant: '#1F293D',
		userText: '#F8FAFC',
		assistantText: '#E2E8F0',
	},

	// UI State
	loading: '#172036',
	insight: '#2B1E0A',
	insightBorder: '#9A6700',
};

export const colors = lightColors;

export type AppColors = typeof lightColors;

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
		shadowColor: lightColors.neutral.text,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	md: {
		shadowColor: lightColors.neutral.text,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.07,
		shadowRadius: 14,
		elevation: 3,
	},
	lg: {
		shadowColor: lightColors.neutral.text,
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.07,
		shadowRadius: 18,
		elevation: 4,
	},
	xl: {
		shadowColor: lightColors.neutral.text,
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.08,
		shadowRadius: 20,
		elevation: 5,
	},
};
