import { StorageKey } from '@enums/StorageKey';
import { Auth0Service, type AuthService } from '@services/Auth0Service';
import type { StorageService } from '@services/StorageService';
import { parseJwtUserId } from '@utils/jwtUtils';
import type { Dispatch } from 'react';

export type AuthState = {
	token: string | null;
	userId: string | null;
};

export type AuthActions = {
	setToken: (newToken: string | null, userId?: string | null) => void;
	login: () => Promise<void>;
	logout: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;

export type AuthAction =
	| {
			type: 'SET_SESSION';
			token: string | null;
			userId: string | null;
	  }
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
		userId: null,
	};

	return {
		getInitialState() {
			return { ...initialState };
		},

		reducer(state: AuthState, action: AuthAction): AuthState {
			switch (action.type) {
				case 'SET_SESSION':
					return {
						...state,
						token: action.token,
						userId: action.userId,
					};
				case 'LOGOUT':
					return { ...state, token: null, userId: null };
			}
		},

		createActions(
			dispatch: Dispatch<AuthAction>,
			storage: StorageService,
		): AuthActions {
			function setToken(
				token: string | null,
				userId?: string | null,
			) {
				const derivedUserId = userId ?? parseJwtUserId(token);

				dispatch({
					type: 'SET_SESSION',
					token,
					userId: derivedUserId,
				});
				async function persistSession(): Promise<void> {
					try {
						await storage.saveItem(token, StorageKey.AuthToken);
						await storage.saveItem(
							derivedUserId,
							StorageKey.AuthUserId,
						);
					} catch (error) {
						console.error(
							'[AuthStore] Failed to persist auth session:',
							error,
						);
					}
				}

				persistSession();
			}

			async function login() {
				const session = await authService.login();
				dispatch({
					type: 'SET_SESSION',
					token: session.token,
					userId: session.userId,
				});
				await storage.saveItem(session.token, StorageKey.AuthToken);
				await storage.saveItem(
					session.userId,
					StorageKey.AuthUserId,
				);
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
				await storage.clearItem(StorageKey.AuthUserId);
			}

			return { setToken, login, logout };
		},
	};
};
