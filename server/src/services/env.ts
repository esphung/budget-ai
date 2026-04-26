import dotenv from 'dotenv';

/**
 * Central environment config service.
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
	port: optional('PORT', '3001'),

	plaid: {
		clientId: required('PLAID_CLIENT_ID'),
		secret: required('PLAID_SECRET'),
		environment: optional('PLAID_ENV', 'sandbox'),
	},
	openAi: {
		apiKey: required('OPENAI_API_KEY'),
		baseUrl: optional('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
		model: optional('OPENAI_MODEL', 'gpt-4.1-nano'),
	},
} as const;
