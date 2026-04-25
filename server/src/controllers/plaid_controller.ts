import {
	Configuration,
	CountryCode,
	LinkTokenCreateRequest,
	PlaidApi,
	PlaidEnvironments,
	Products,
} from 'plaid';
import { env } from '../services/env';

const configuration = new Configuration({
	basePath:
		env.plaid.environment === 'sandbox'
			? PlaidEnvironments.sandbox
			: PlaidEnvironments.production,
	baseOptions: {
		headers: {
			'PLAID-CLIENT-ID': env.plaid.clientId,
			'PLAID-SECRET': env.plaid.secret,
		},
	},
});

const plaidApi = new PlaidApi(configuration);

export class PlaidController {
	/** Persists the access token after a successful public-token exchange. */
	private accessToken: string | null = null;

	async createLinkToken() {
		const response = await plaidApi.linkTokenCreate({
			client_name: 'BudgetAI',
			client_id: env.plaid.clientId,
			secret: env.plaid.secret,
			country_codes: [CountryCode.Us],
			language: 'en',
			user: {
				// TODO: replace with authenticated user ID from auth store
				client_user_id: 'user-id',
			},
			products: [Products.Transactions],
		} satisfies LinkTokenCreateRequest);

		return response.data;
	}

	async exchangePublicToken(publicToken: string) {
		const response = await plaidApi.itemPublicTokenExchange({
			public_token: publicToken,
		});

		// Store the access token server-side so subsequent data-fetch calls work.
		this.accessToken = response.data.access_token;

		return response.data;
	}

	async getTransactions() {
		if (!this.accessToken) {
			throw new Error(
				'No linked account — exchange a public token first',
			);
		}

		const endDate = new Date().toISOString().split('T')[0] as string;
		const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split('T')[0] as string;

		const response = await plaidApi.transactionsGet({
			access_token: this.accessToken,
			start_date: startDate,
			end_date: endDate,
		});

		return response.data.transactions;
	}

	async getBalances() {
		if (!this.accessToken) {
			throw new Error(
				'No linked account — exchange a public token first',
			);
		}

		const response = await plaidApi.accountsBalanceGet({
			access_token: this.accessToken,
		});

		return response.data.accounts;
	}
}

