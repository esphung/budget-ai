import { createAuthStore } from '@stores/AuthStore';

describe('AuthStore', () => {
	it('initializes with null token', () => {
		const store = createAuthStore();
		expect(store.getInitialState().token).toBeNull();
	});

	it('sets token correctly', () => {
		const store = createAuthStore();
		const state = store.reducer(store.getInitialState(), {
			type: 'SET_TOKEN',
			token: 'test-token',
		});
		expect(state.token).toBe('test-token');
	});

	it('logs out correctly by resetting token to null', () => {
		const store = createAuthStore({ token: 'existing-token' });
		const state = store.reducer(store.getInitialState(), {
			type: 'LOGOUT',
		});
		expect(state.token).toBeNull();
	});

	it('creates typed actions that dispatch reducer events', () => {
		const store = createAuthStore();
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
