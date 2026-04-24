import dotenv from 'dotenv';

/**
 * Central environment config service.
 *
 * dotenv.config() is called here so that process.env is populated
 * before any required() validation runs, regardless of import order.
 */
dotenv.config();

function required(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}

function optional(key: string, defaultValue: string): string {
	return process.env[key] ?? defaultValue;
}

export const env = {
	port: optional('PORT', '3000'),

	plaid: {
		clientId: required('PLAID_CLIENT_ID'),
		secret: required('PLAID_SECRET'),
		// Defaults to sandbox so a missing value never accidentally hits production.
		environment: optional('PLAID_ENV', 'sandbox'),
	},
} as const;
