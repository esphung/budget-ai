import { createAuthStore } from '@stores/AuthStore';
import { StorageService } from '@services/StorageService';
import { act } from '@testing-library/react-native';

const mockAuthService = {
	login: jest
		.fn()
		.mockResolvedValue({ token: 'auth0-token', userId: 'auth0|123' }),
	logout: jest.fn().mockResolvedValue(undefined),
};

// @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => {
	return {
		AsyncStorage: {
			setItem: jest.fn(),
			getItem: jest.fn().mockResolvedValue('mock-token'),
			removeItem: jest.fn(),
		},
	};
});

describe('AuthStore', () => {
	const storage = StorageService.getInstance('@auth');

	it('initializes with null token', () => {
		const store = createAuthStore(mockAuthService);
		expect(store.getInitialState().token).toBeNull();
	});

	it('sets token correctly', () => {
		const store = createAuthStore(mockAuthService);
		const state = store.reducer(store.getInitialState(), {
			type: 'SET_SESSION',
			token: 'test-token',
			userId: 'auth0|test-user',
		});
		expect(state.token).toBe('test-token');
		expect(state.userId).toBe('auth0|test-user');
	});

	it('logs out correctly by resetting token to null', () => {
		const store = createAuthStore(mockAuthService);
		const state = store.reducer(
			{ token: 'existing-token', userId: 'auth0|existing' },
			{
				type: 'LOGOUT',
			},
		);
		expect(state.token).toBeNull();
		expect(state.userId).toBeNull();
	});

	it('creates typed actions that dispatch reducer events', async () => {
		const store = createAuthStore(mockAuthService);
		const dispatch = jest.fn();
		const actions = store.createActions(dispatch, storage);

		act(() => {
			actions.setToken('token-from-action', 'auth0|token-action');
		});

		await act(async () => {
			await actions.login();
			await actions.logout();
		});

		expect(dispatch).toHaveBeenCalledWith({
			type: 'SET_SESSION',
			token: 'token-from-action',
			userId: 'auth0|token-action',
		});
		expect(dispatch).toHaveBeenCalledWith({
			type: 'SET_SESSION',
			token: 'auth0-token',
			userId: 'auth0|123',
		});
		expect(dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
	});
});
