import axios, {
	AxiosInstance,
	AxiosResponse,
	CanceledError,
	InternalAxiosRequestConfig,
} from 'axios';

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

function toReadableErrorMessage(value: unknown): string | null {
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed ? trimmed : null;
	}

	if (typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}

	if (!value || typeof value !== 'object') {
		return null;
	}

	const record = value as Record<string, unknown>;
	const nested =
		toReadableErrorMessage(record.message) ??
		toReadableErrorMessage(record.error) ??
		toReadableErrorMessage(record.detail) ??
		toReadableErrorMessage(record.details);

	if (nested) {
		return nested;
	}

	try {
		return JSON.stringify(value);
	} catch {
		return null;
	}
}

function normalizeError(err: unknown): ApiError {
	if (err instanceof CanceledError) {
		return { status: 0, message: 'Request cancelled', cause: err };
	}
	if (axios.isAxiosError(err)) {
		const message =
			toReadableErrorMessage(err.response?.data) ??
			toReadableErrorMessage(err.message) ??
			'Request failed';

		return {
			status: err.response?.status ?? 0,
			message,
			cause: err,
		};
	}
	return { status: 0, message: 'Unknown error', cause: err };
}

class BaseService {
	protected readonly http: AxiosInstance;
	private authToken: string | null = null;

	constructor(baseUrl: string) {
		this.http = axios.create({
			baseURL: baseUrl,
			timeout: 15_000,
		});

		this.http.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				if (this.authToken) {
					config.headers.Authorization = `Bearer ${this.authToken}`;
				}
				return config;
			},
		);
	}

	setAuthToken(token: string | null): void {
		this.authToken = token;
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
		): Promise<{
			message: string;
			actions?: Array<{
				type: 'save_transaction';
				payload: Record<string, unknown>;
			}>;
		}> =>
			this.request(() =>
				this.http.post(
					'/openai/send-message',
					{ messages },
					{ signal },
				),
			),
	};

	readonly transactions = {
		list: (signal?: AbortSignal): Promise<{ data: unknown[] }> =>
			this.request(() =>
				this.http.get<{ data: unknown[] }>('/transactions', {
					signal,
				}),
			),
		create: (
			body: {
				id?: string;
				accountId?: string | null;
				amount: number;
				merchant?: string | null;
				category?: string | null;
				transactionType: 'expense' | 'income' | 'transfer';
				date: string;
				source: 'manual' | 'ai';
				createdAt: string;
			},
			signal?: AbortSignal,
		): Promise<unknown> =>
			this.request(() =>
				this.http.post('/transactions', body, { signal }),
			),
		clear: (signal?: AbortSignal): Promise<unknown> =>
			this.request(() =>
				this.http.delete('/transactions/all', { signal }),
			),
		delete: async (
			id: string,
			signal?: AbortSignal,
		): Promise<unknown> => {
			try {
				return await this.request(() =>
					this.http.delete(`/transactions/${id}`, {
						signal,
					}),
				);
			} catch (error) {
				const apiError = error as ApiError;
				if (apiError.status !== 404) {
					throw error;
				}

				return this.request(() =>
					this.http.delete('/transactions', {
						signal,
						params: {
							id,
						},
					}),
				);
			}
		},
	};

	readonly budgets = {
		list: (signal?: AbortSignal): Promise<{ data: unknown[] }> =>
			this.request(() =>
				this.http.get<{ data: unknown[] }>('/budgets', { signal }),
			),
		create: (
			body: {
				id?: string;
				name: string;
				amount: number;
				categoryId?: string | null;
				periodStart: string;
				periodEnd: string;
				createdAt?: string;
				updatedAt?: string;
			},
			signal?: AbortSignal,
		): Promise<unknown> =>
			this.request(() =>
				this.http.post('/budgets', body, { signal }),
			),
		update: (
			id: string,
			body: {
				name?: string;
				amount?: number;
				categoryId?: string | null;
				periodStart?: string;
				periodEnd?: string;
				updatedAt?: string;
			},
			signal?: AbortSignal,
		): Promise<unknown> =>
			this.request(() =>
				this.http.put(`/budgets/${id}`, body, { signal }),
			),
		delete: (id: string, signal?: AbortSignal): Promise<unknown> =>
			this.request(() =>
				this.http.delete(`/budgets/${id}`, { signal }),
			),
		clear: (signal?: AbortSignal): Promise<unknown> =>
			this.request(() =>
				this.http.delete('/budgets/all', { signal }),
			),
	};

	readonly accounts = {
		list: (signal?: AbortSignal): Promise<{ data: unknown[] }> =>
			this.request(() =>
				this.http.get<{ data: unknown[] }>('/accounts', { signal }),
			),
		create: (
			body: {
				id?: string;
				name: string;
				accountType: string;
				currency: string;
				createdAt?: string;
				updatedAt?: string;
			},
			signal?: AbortSignal,
		): Promise<unknown> =>
			this.request(() =>
				this.http.post('/accounts', body, { signal }),
			),
		update: (
			id: string,
			body: {
				name?: string;
				accountType?: string;
				currency?: string;
				updatedAt?: string;
			},
			signal?: AbortSignal,
		): Promise<unknown> =>
			this.request(() =>
				this.http.put(`/accounts/${id}`, body, { signal }),
			),
		delete: (id: string, signal?: AbortSignal): Promise<unknown> =>
			this.request(() =>
				this.http.delete(`/accounts/${id}`, { signal }),
			),
		clear: (signal?: AbortSignal): Promise<unknown> =>
			this.request(() =>
				this.http.delete('/accounts/all', { signal }),
			),
	};

	readonly categories = {
		list: (signal?: AbortSignal): Promise<{ data: unknown[] }> =>
			this.request(() =>
				this.http.get<{ data: unknown[] }>('/categories', {
					signal,
				}),
			),
		create: (
			body: {
				id?: string;
				name: string;
				color?: string | null;
				icon?: string | null;
				createdAt?: string;
				updatedAt?: string;
			},
			signal?: AbortSignal,
		): Promise<unknown> =>
			this.request(() =>
				this.http.post('/categories', body, { signal }),
			),
		update: (
			id: string,
			body: {
				name?: string;
				color?: string | null;
				icon?: string | null;
				updatedAt?: string;
			},
			signal?: AbortSignal,
		): Promise<unknown> =>
			this.request(() =>
				this.http.put(`/categories/${id}`, body, { signal }),
			),
		delete: (id: string, signal?: AbortSignal): Promise<unknown> =>
			this.request(() =>
				this.http.delete(`/categories/${id}`, { signal }),
			),
		clear: (signal?: AbortSignal): Promise<unknown> =>
			this.request(() =>
				this.http.delete('/categories/all', { signal }),
			),
	};
}
