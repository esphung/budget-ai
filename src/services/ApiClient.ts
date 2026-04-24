import axios, {
	AxiosInstance,
	AxiosResponse,
	CanceledError,
	InternalAxiosRequestConfig,
} from 'axios';

// ── Shared config ─────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3001';
const DEFAULT_TIMEOUT_MS = 15_000;

// ── Request / response contracts ─────────────────────────────────────────────

export interface ApiError {
	status: number;
	message: string;
	/** Original error for debugging — never shown to end users */
	cause?: unknown;
}

// Plaid
export interface GetLinkTokenResponse {
	link_token: string;
	expiration: string;
	request_id: string;
	hosted_link_url?: string; // Optional URL for Plaid-hosted Link flow (if supported by the backend)
	user_id?: string; // Optional user ID if returned by the server for client-side use
}

export interface ExchangePublicTokenRequest {
	publicToken: string;
}

export interface ExchangePublicTokenResponse {
	accessToken: string;
}

// ── Error normalizer ──────────────────────────────────────────────────────────

function normalizeError(err: unknown): ApiError {
	if (err instanceof CanceledError) {
		return { status: 0, message: 'Request cancelled', cause: err };
	}
	if (axios.isAxiosError(err)) {
		return {
			status: err.response?.status ?? 0,
			message:
				(err.response?.data as { message?: string })?.message ??
				err.message,
			cause: err,
		};
	}
	return { status: 0, message: 'Unknown error', cause: err };
}

// ── Client ────────────────────────────────────────────────────────────────────

class ApiClient {
	private static instance: ApiClient;
	private readonly http: AxiosInstance;

	private constructor(baseUrl: string = BASE_URL) {
		this.http = axios.create({
			baseURL: baseUrl,
			timeout: DEFAULT_TIMEOUT_MS,
		});

		// Attach auth token from store on every request when available
		this.http.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				// TODO: read token from secure storage or auth store when implemented
				// config.headers.Authorization = `Bearer ${token}`;
				return config;
			},
		);
	}

	static getInstance(): ApiClient {
		if (!ApiClient.instance) {
			ApiClient.instance = new ApiClient();
		}
		return ApiClient.instance;
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	/**
	 * Wraps an axios call and normalizes errors into ApiError.
	 * Pass an AbortSignal for cancellation support.
	 */
	private async request<T>(
		call: () => Promise<AxiosResponse<T>>,
	): Promise<T> {
		try {
			const response = await call();
			return response.data;
		} catch (err) {
			throw normalizeError(err);
		}
	}

	// ── Plaid ─────────────────────────────────────────────────────────────────

	readonly plaid = {
		/**
		 * Creates a Plaid Link token to initialize the Link flow on the client.
		 */
		getLinkToken: (
			signal?: AbortSignal,
		): Promise<GetLinkTokenResponse> =>
			this.request(() =>
				this.http.get<GetLinkTokenResponse>('/plaid/link-token', {
					signal,
				}),
			),

		/**
		 * Exchanges a public token (returned by Plaid Link) for a persistent
		 * access token stored server-side.
		 */
		exchangePublicToken: (
			body: ExchangePublicTokenRequest,
			signal?: AbortSignal,
		): Promise<ExchangePublicTokenResponse> =>
			this.request(() =>
				this.http.post<ExchangePublicTokenResponse>(
					'/plaid/exchange-token',
					body,
					{ signal },
				),
			),
	};
}

export const apiClient = ApiClient.getInstance();
