import { usePlaidLink } from '@hooks/usePlaidLink';
import { apiClient } from '@services/ApiClient';
import { act, renderHook } from '@testing-library/react-native';
import {
	create,
	LinkErrorCode,
	LinkErrorType,
	LinkExit,
	open,
} from 'react-native-plaid-link-sdk';

jest.mock('@services/ApiClient', () => ({
	apiClient: {
		plaid: {
			getLinkToken: jest.fn(),
			exchangePublicToken: jest.fn(),
		},
	},
}));

jest.mock('react-native-plaid-link-sdk', () => ({
	create: jest.fn(),
	open: jest.fn(),

	LinkErrorCode: {
		ACCOUNTS_LIMIT: 'ACCOUNTS_LIMIT',
	},
	LinkErrorType: {
		API_ERROR: 'API_ERROR',
		INVALID_REQUEST: 'INVALID_REQUEST',
	},
}));

type OpenArgs = Parameters<typeof open>[0];

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockCreate = create as jest.MockedFunction<typeof create>;
const mockOpen = open as jest.MockedFunction<typeof open>;

function getOpenHandlers(): OpenArgs {
	const call = mockOpen.mock.calls.at(-1);
	if (!call) {
		throw new Error('Expected open() to have been called');
	}
	return call[0];
}

describe('usePlaidLink', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(mockApiClient.plaid.getLinkToken as jest.Mock).mockResolvedValue({
			link_token: 'link-token-1',
			expiration: '2026-04-25T00:00:00Z',
			request_id: 'req_1',
		});
		(
			mockApiClient.plaid.exchangePublicToken as jest.Mock
		).mockResolvedValue({
			accessToken: 'access-token-1',
		});
	});

	it('refreshLinkToken fetches and stores a token', async () => {
		const { result } = renderHook(() => usePlaidLink());

		expect(result.current.hasLinkToken).toBe(false);

		await act(async () => {
			await result.current.refreshLinkToken();
		});

		expect(mockApiClient.plaid.getLinkToken).toHaveBeenCalledTimes(1);
		expect(result.current.hasLinkToken).toBe(true);
	});

	it('clearLinkToken removes the stored token', async () => {
		const { result } = renderHook(() => usePlaidLink());

		await act(async () => {
			await result.current.refreshLinkToken();
		});
		expect(result.current.hasLinkToken).toBe(true);

		act(() => {
			result.current.clearLinkToken();
		});

		expect(result.current.hasLinkToken).toBe(false);
	});

	it('startPlaidLink fetches a token on demand and opens Plaid', async () => {
		const { result } = renderHook(() => usePlaidLink());

		await act(async () => {
			await result.current.startPlaidLink();
		});

		expect(mockApiClient.plaid.getLinkToken).toHaveBeenCalledTimes(1);
		expect(mockCreate).toHaveBeenCalledWith({ token: 'link-token-1' });
		expect(mockOpen).toHaveBeenCalledTimes(1);
		expect(result.current.isStarting).toBe(true);
	});

	it('clears token and emits linked accounts on successful link', async () => {
		const onLinkedAccounts = jest.fn();
		const { result } = renderHook(() =>
			usePlaidLink({ onLinkedAccounts }),
		);

		await act(async () => {
			await result.current.startPlaidLink();
		});

		const handlers = getOpenHandlers();
		const accounts = [
			{
				id: 'acc_1',
				name: 'Checking',
				mask: '1234',
				subtype: 'checking',
			},
		] as any;

		await act(async () => {
			await handlers.onSuccess({
				publicToken: 'public-token-1',
				metadata: {
					institution: { name: 'Test Bank', id: 'ins_1' },
					accounts,
					linkSessionId: 'session_1',
					transferStatus: 'unknown',
				},
			} as any);
		});

		expect(
			mockApiClient.plaid.exchangePublicToken,
		).toHaveBeenCalledWith({
			publicToken: 'public-token-1',
		});
		expect(onLinkedAccounts).toHaveBeenCalledWith(accounts);
		expect(result.current.hasLinkToken).toBe(false);
		expect(result.current.isStarting).toBe(false);
	});

	it('clears token and invokes exit callback when user exits Link', async () => {
		const onExit = jest.fn();
		const { result } = renderHook(() => usePlaidLink({ onExit }));

		await act(async () => {
			await result.current.refreshLinkToken();
		});
		expect(result.current.hasLinkToken).toBe(true);

		await act(async () => {
			await result.current.startPlaidLink();
		});

		const handlers = getOpenHandlers();
		const exitPayload: LinkExit = {
			error: {
				displayMessage: 'User exited the Link flow',
				errorCode: LinkErrorCode.ACCOUNTS_LIMIT,
				errorMessage:
					'The user chose to exit the Link flow before completing.',
				errorType: LinkErrorType.INVALID_REQUEST,
			},
			metadata: {
				requestId: 'req_1',
				institution: {
					name: 'Test Bank',
					id: 'ins_1',
				},
				linkSessionId: 'session_1',
			},
		};

		act(() => {
			handlers.onExit?.(exitPayload);
		});

		expect(onExit).toHaveBeenCalledWith(exitPayload);
		expect(result.current.hasLinkToken).toBe(false);
		expect(result.current.isStarting).toBe(false);
	});
});
