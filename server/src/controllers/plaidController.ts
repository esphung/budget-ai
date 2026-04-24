import {
	Configuration,
	CountryCode,
	LinkTokenCreateRequest,
	PlaidApi,
	PlaidEnvironments,
	Products,
} from 'plaid';
import { env } from '../services/env';

const CLIENT_NAME = 'BudgetAI';

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
	async createLinkToken() {
		const response = await plaidApi.linkTokenCreate({
			client_name: CLIENT_NAME,
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

		return response.data;
	}
}
