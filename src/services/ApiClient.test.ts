import axios from 'axios';
import {
	GetLinkTokenResponse,
	ExchangePublicTokenResponse,
	HealthCheckResponse,
	ApiError,
	ApiClient,
} from '@services/ApiClient';

const apiClient = new ApiClient('http://localhost:3001');

// ── Axios mock setup ──────────────────────────────────────────────────────────

jest.mock('axios', () => {
	const mockAxiosInstance = {
		get: jest.fn(),
		post: jest.fn(),
		interceptors: {
			request: { use: jest.fn() },
			response: { use: jest.fn() },
		},
	};
	return {
		create: jest.fn(() => mockAxiosInstance),
		isAxiosError: jest.fn(),
		CanceledError: class CanceledError extends Error {
			name = 'CanceledError';
		},
		...mockAxiosInstance,
	};
});

const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0]
	?.value ?? {
	get: jest.fn(),
	post: jest.fn(),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeAxiosResponse<T>(data: T) {
	return Promise.resolve({
		data,
		status: 200,
		statusText: 'OK',
		headers: {},
		config: {},
	});
}

function makeAxiosError(status: number, message: string) {
	const err = new Error(message) as any;
	err.response = { status, data: { message } };
	(axios.isAxiosError as unknown as jest.Mock).mockReturnValueOnce(true);
	return err;
}

function makeAxiosErrorWithErrorField(status: number, error: string) {
	const err = new Error(error) as any;
	err.response = { status, data: { error } };
	(axios.isAxiosError as unknown as jest.Mock).mockReturnValueOnce(true);
	return err;
}

// ── health.check ────────────────────────────────────────────────────────────

describe('apiClient.health.check', () => {
	it('returns server health on success', async () => {
		const payload: HealthCheckResponse = {
			status: 'ok',
		};
		mockAxiosInstance.get.mockReturnValueOnce(
			makeAxiosResponse(payload),
		);

		const result = await apiClient.health.check();

		expect(result).toEqual({ status: 'ok' });
		expect(mockAxiosInstance.get).toHaveBeenCalledWith(
			'/health',
			expect.objectContaining({ signal: undefined }),
		);
	});

	it('normalizes a health check network failure into ApiError', async () => {
		const networkErr = new Error('Network Error') as any;
		networkErr.response = undefined;
		(axios.isAxiosError as unknown as jest.Mock).mockReturnValueOnce(
			true,
		);
		mockAxiosInstance.get.mockRejectedValueOnce(networkErr);

		await expect(apiClient.health.check()).rejects.toMatchObject<
			Partial<ApiError>
		>({
			status: 0,
			message: 'Network Error',
		});
	});
});

// ── plaid.getLinkToken ────────────────────────────────────────────────────────

describe('apiClient.plaid.getLinkToken', () => {
	it('returns link token data on success', async () => {
		const payload: GetLinkTokenResponse = {
			link_token: 'link-sandbox-abc',
			expiration: '2026-04-25T00:00:00Z',
			request_id: 'req_1',
		};
		mockAxiosInstance.get.mockReturnValueOnce(
			makeAxiosResponse(payload),
		);

		const result = await apiClient.plaid.getLinkToken();

		expect(result.link_token).toBe('link-sandbox-abc');
		expect(mockAxiosInstance.get).toHaveBeenCalledWith(
			'/plaid/link-token',
			expect.objectContaining({ signal: undefined }),
		);
	});

	it('forwards an AbortSignal to the request', async () => {
		const payload: GetLinkTokenResponse = {
			link_token: 'link-sandbox-xyz',
			expiration: '2026-04-25T00:00:00Z',
			request_id: 'req_2',
		};
		mockAxiosInstance.get.mockReturnValueOnce(
			makeAxiosResponse(payload),
		);
		const controller = new AbortController();

		await apiClient.plaid.getLinkToken(controller.signal);

		expect(mockAxiosInstance.get).toHaveBeenCalledWith(
			'/plaid/link-token',
			expect.objectContaining({ signal: controller.signal }),
		);
	});

	it('normalizes an axios error into ApiError', async () => {
		mockAxiosInstance.get.mockRejectedValueOnce(
			makeAxiosError(401, 'Unauthorized'),
		);

		await expect(apiClient.plaid.getLinkToken()).rejects.toMatchObject<
			Partial<ApiError>
		>({
			status: 401,
			message: 'Unauthorized',
		});
	});

	it('normalizes a network error (no response) into ApiError with status 0', async () => {
		const networkErr = new Error('Network Error') as any;
		networkErr.response = undefined;
		(axios.isAxiosError as unknown as jest.Mock).mockReturnValueOnce(
			true,
		);
		mockAxiosInstance.get.mockRejectedValueOnce(networkErr);

		await expect(apiClient.plaid.getLinkToken()).rejects.toMatchObject<
			Partial<ApiError>
		>({
			status: 0,
			message: 'Network Error',
		});
	});
});

// ── plaid.exchangePublicToken ─────────────────────────────────────────────────

describe('apiClient.plaid.exchangePublicToken', () => {
	it('posts the public token and returns the access token', async () => {
		const payload: ExchangePublicTokenResponse = {
			accessToken: 'access-sandbox-123',
		};
		mockAxiosInstance.post.mockReturnValueOnce(
			makeAxiosResponse(payload),
		);

		const result = await apiClient.plaid.exchangePublicToken({
			publicToken: 'public-sandbox-abc',
		});

		expect(result.accessToken).toBe('access-sandbox-123');
		expect(mockAxiosInstance.post).toHaveBeenCalledWith(
			'/plaid/exchange-token',
			{ publicToken: 'public-sandbox-abc' },
			expect.objectContaining({ signal: undefined }),
		);
	});

	it('normalizes a 500 server error into ApiError', async () => {
		mockAxiosInstance.post.mockRejectedValueOnce(
			makeAxiosError(500, 'Internal server error'),
		);

		await expect(
			apiClient.plaid.exchangePublicToken({
				publicToken: 'public-sandbox-abc',
			}),
		).rejects.toMatchObject<Partial<ApiError>>({
			status: 500,
			message: 'Internal server error',
		});
	});

	it('normalizes backend payloads that return an error field', async () => {
		mockAxiosInstance.post.mockRejectedValueOnce(
			makeAxiosErrorWithErrorField(
				400,
				'Missing publicToken in request body',
			),
		);

		await expect(
			apiClient.plaid.exchangePublicToken({
				publicToken: '',
			}),
		).rejects.toMatchObject<Partial<ApiError>>({
			status: 400,
			message: 'Missing publicToken in request body',
		});
	});

	it('normalizes an unknown (non-axios) error into ApiError', async () => {
		(axios.isAxiosError as unknown as jest.Mock).mockReturnValueOnce(
			false,
		);
		mockAxiosInstance.post.mockRejectedValueOnce(
			new Error('Something went wrong'),
		);

		await expect(
			apiClient.plaid.exchangePublicToken({ publicToken: 'tok' }),
		).rejects.toMatchObject<Partial<ApiError>>({
			status: 0,
			message: 'Unknown error',
		});
	});
});
