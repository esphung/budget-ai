import axios, {
	AxiosInstance,
	AxiosResponse,
	CanceledError,
	InternalAxiosRequestConfig,
} from 'axios';
import { AssistantResponse } from '../types/AssistantResponse';

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
		generateText: (
			content: string,
			max_completion_tokens?: number,
			signal?: AbortSignal,
		): Promise<{ data: { text: { content: string } } }> =>
			this.request(() =>
				this.http.post<{ data: { text: { content: string } } }>(
					'/openai/generate-text',
					{ content, max_completion_tokens },
					{ signal },
				),
			),

		sendMessage: (
			messages: { role: string; content: string }[],
			signal?: AbortSignal,
		): Promise<{ data: AssistantResponse }> =>
			this.request(() =>
				this.http.post<{ data: AssistantResponse }>(
					'/openai/send-message',
					{ messages },
					{ signal },
				),
			),
	};
}
