import type { Dispatch } from 'react';

export type AuthState = {
	token: string | null;
};

export type AuthActions = {
	setToken: (newToken: string | null) => void;
	logout: () => void;
};

export type AuthStore = AuthState & AuthActions;

export type AuthAction =
	| { type: 'SET_TOKEN'; token: string | null }
	| { type: 'LOGOUT' };

export type AuthStoreFactory = {
	getInitialState: () => AuthState;
	reducer: (state: AuthState, action: AuthAction) => AuthState;
	createActions: (dispatch: Dispatch<AuthAction>) => AuthActions;
};

export const createAuthStore = (
	initialStateOverrides?: Partial<AuthState>,
): AuthStoreFactory => {
	const initialState: AuthState = {
		token: null,
		...initialStateOverrides,
	};

	return {
		getInitialState() {
			return { ...initialState };
		},

		reducer(state: AuthState, action: AuthAction): AuthState {
			switch (action.type) {
				case 'SET_TOKEN':
					return { ...state, token: action.token };
				case 'LOGOUT':
					return { ...state, token: null };
			}
		},

		createActions(dispatch: Dispatch<AuthAction>): AuthActions {
			return {
				setToken(token: string | null) {
					dispatch({ type: 'SET_TOKEN', token });
				},
				logout() {
					dispatch({ type: 'LOGOUT' });
				},
			};
		},
	};
};
