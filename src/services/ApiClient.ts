import axios, {
	AxiosInstance,
	AxiosResponse,
	CanceledError,
	InternalAxiosRequestConfig,
} from 'axios';
import { OpenAIAssistantResponse } from '../../shared/types/openai';

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
	hosted_link_url?: string;
	user_id?: string;
}

export interface ExchangePublicTokenRequest {
	publicToken: string;
}

export interface ExchangePublicTokenResponse {
	accessToken: string;
}

export interface HealthCheckResponse {
	status: string;
}

function normalizeError(err: unknown): ApiError {
	if (err instanceof CanceledError) {
		return { status: 0, message: 'Request cancelled', cause: err };
	}
	if (axios.isAxiosError(err)) {
		const data = err.response?.data as
			| { message?: string; error?: string }
			| undefined;
		return {
			status: err.response?.status ?? 0,
			message: data?.message ?? data?.error ?? err.message,
			cause: err,
		};
	}
	return { status: 0, message: 'Unknown error', cause: err };
}

class BaseService {
	protected readonly http: AxiosInstance;

	constructor(baseUrl: string) {
		this.http = axios.create({
			baseURL: baseUrl,
			timeout: 15_000,
		});

		this.http.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				// TODO: Attach auth token dynamically
				return config;
			},
		);
	}

	protected async request<T>(
		call: () => Promise<AxiosResponse<T>>,
	): Promise<T> {
		try {
			const response = await call();
			return response.data;
		} catch (err) {
			throw normalizeError(err);
		}
	}
}

export class ApiClient extends BaseService {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	readonly health = {
		check: (signal?: AbortSignal): Promise<HealthCheckResponse> =>
			this.request(() =>
				this.http.get<HealthCheckResponse>('/health', { signal }),
			),
	};

	// ── Plaid ─────────────────────────────────────────────────────────────────

	readonly plaid = {
		getLinkToken: (
			signal?: AbortSignal,
		): Promise<GetLinkTokenResponse> =>
			this.request(() =>
				this.http.get<GetLinkTokenResponse>('/plaid/link-token', {
					signal,
				}),
			),

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

	// ── OpenAI ────────────────────────────────────────────────────────────────

	readonly openai = {
		sendMessage: (
			messages: { role: string; content: string }[],
			signal?: AbortSignal,
		): Promise<OpenAIAssistantResponse> =>
			this.request(() =>
				this.http.post(
					'/openai/send-message',
					{ messages },
					{ signal },
				),
			),
	};
}
