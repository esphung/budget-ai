import Auth0 from 'react-native-auth0';
import { parseJwtUserId } from '@utils/jwtUtils';

type Auth0Config = {
	domain: string;
	clientId: string;
};

const AUTH0_CONFIG: Auth0Config = {
	domain: 'dev-ffksazh23yw1bfhr.us.auth0.com',
	clientId: 'u3Zwo5Zi5TtXPjU5QXaq6qdoYDPfnAEn',
};

export type AuthService = {
	login: () => Promise<{ token: string; userId: string }>;
	logout: () => Promise<void>;
};

export class Auth0Service implements AuthService {
	private static instance: Auth0Service | null = null;
	private readonly client: Auth0;
	private readonly config: Auth0Config;

	static getInstance(config: Auth0Config = AUTH0_CONFIG): Auth0Service {
		if (!Auth0Service.instance) {
			Auth0Service.instance = new Auth0Service(config);
		}

		return Auth0Service.instance;
	}

	private constructor(config: Auth0Config) {
		this.config = config;
		this.client = new Auth0({
			domain: config.domain,
			clientId: config.clientId,
		});
	}

	private assertConfigured(): void {
		if (
			this.config.domain === 'YOUR_AUTH0_DOMAIN' ||
			this.config.clientId === 'YOUR_AUTH0_CLIENT_ID'
		) {
			throw new Error(
				'Missing Auth0 configuration. Update AUTH0_CONFIG in src/services/Auth0Service.ts.',
			);
		}
	}

	async login(): Promise<{ token: string; userId: string }> {
		this.assertConfigured();

		const credentials = await this.client.webAuth.authorize({
			scope: 'openid profile email offline_access',
		});

		await this.client.credentialsManager.saveCredentials(credentials);

		const token = credentials.idToken ?? credentials.accessToken;
		if (!token) {
			throw new Error(
				'Auth0 login succeeded but no token was returned.',
			);
		}

		let userId = parseJwtUserId(credentials.idToken ?? null);

		if (!userId && credentials.accessToken) {
			const profile = await this.client.auth.userInfo({
				token: credentials.accessToken,
			});
			if (profile?.sub) {
				userId = String(profile.sub);
			}
		}

		if (!userId) {
			throw new Error(
				'Auth0 login succeeded but user id (sub) was not available.',
			);
		}

		return { token, userId };
	}

	async logout(): Promise<void> {
		this.assertConfigured();

		try {
			await this.client.webAuth.clearSession();
		} catch (error) {
			console.warn(
				'[Auth0Service] clearSession failed; continuing to clear local credentials.',
				error,
			);
		}

		await this.client.credentialsManager.clearCredentials();
	}
}
