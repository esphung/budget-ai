import { StorageKey } from '@enums/StorageKey';
import type { StorageService } from '@services/StorageService';
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
	createActions: (
		dispatch: Dispatch<AuthAction>,
		storage: StorageService,
	) => AuthActions;
};

export const createAuthStore = (): AuthStoreFactory => {
	const initialState: AuthState = {
		token: null,
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

		createActions(
			dispatch: Dispatch<AuthAction>,
			storage: StorageService,
		): AuthActions {
			function setToken(token: string | null) {
				dispatch({ type: 'SET_TOKEN', token });
				storage.saveItem(token, StorageKey.AuthToken);
			}

			function logout() {
				dispatch({ type: 'LOGOUT' });
				storage.clearItem(StorageKey.AuthToken);
			}

			return { setToken, logout };
		},
	};
};
