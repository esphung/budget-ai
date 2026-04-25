import { createAuthStore } from '@stores/AuthStore';
import { StorageService } from '@services/StorageService';

describe('AuthStore', () => {
	const storage = StorageService.getInstance('@test_storage_key');

	it('initializes with null token', () => {
		const store = createAuthStore(storage);
		expect(store.getInitialState().token).toBeNull();
	});

	it('sets token correctly', () => {
		const store = createAuthStore(storage);
		const state = store.reducer(store.getInitialState(), {
			type: 'SET_TOKEN',
			token: 'test-token',
		});
		expect(state.token).toBe('test-token');
	});

	it('logs out correctly by resetting token to null', () => {
		const store = createAuthStore(storage);
		const state = store.reducer(
			{ token: 'existing-token' },
			{
				type: 'LOGOUT',
			},
		);
		expect(state.token).toBeNull();
	});

	it('creates typed actions that dispatch reducer events', () => {
		const store = createAuthStore(storage);
		const dispatch = jest.fn();
		const actions = store.createActions(dispatch);

		actions.setToken('token-from-action');
		actions.logout();

		expect(dispatch).toHaveBeenCalledWith({
			type: 'SET_TOKEN',
			token: 'token-from-action',
		});
		expect(dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
	});
});
