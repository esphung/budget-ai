import { StorageKey } from '@enums/StorageKey';
import { Auth0Service, type AuthService } from '@services/Auth0Service';
import type { StorageService } from '@services/StorageService';
import type { Dispatch } from 'react';

export type AuthState = {
	token: string | null;
};

export type AuthActions = {
	setToken: (newToken: string | null) => void;
	login: () => Promise<void>;
	logout: () => Promise<void>;
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

export const createAuthStore = (
	authService: AuthService = Auth0Service.getInstance(),
): AuthStoreFactory => {
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
				async function persistToken(): Promise<void> {
					try {
						await storage.saveItem(token, StorageKey.AuthToken);
					} catch (error) {
						console.error(
							'[AuthStore] Failed to persist auth token:',
							error,
						);
					}
				}

				persistToken();
			}

			async function login() {
				const token = await authService.login();
				dispatch({ type: 'SET_TOKEN', token });
				await storage.saveItem(token, StorageKey.AuthToken);
			}

			async function logout() {
				try {
					await authService.logout();
				} catch (error) {
					console.error(
						'[AuthStore] Remote logout failed. Clearing local auth state anyway:',
						error,
					);
				}
				dispatch({ type: 'LOGOUT' });
				await storage.clearItem(StorageKey.AuthToken);
			}

			return { setToken, login, logout };
		},
	};
};
