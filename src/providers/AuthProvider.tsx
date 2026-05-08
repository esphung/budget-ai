import { StorageKey } from '@enums/StorageKey';
import { StorageService } from '@services/StorageService';
import { type AuthStore, type AuthStoreFactory } from '@stores/AuthStore';
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useReducer,
} from 'react';

const AuthContext = createContext<AuthStore | null>(null);

AuthContext.displayName = 'AuthContext';

// Storage instance for auth persistence
const storage = StorageService.getInstance('@auth');

export function AuthProvider({
	store,
	children,
}: {
	store: AuthStoreFactory;
	children: React.ReactNode;
}) {
	const [state, dispatch] = useReducer(
		store.reducer,
		store.getInitialState(),
	);
	const actions = useMemo(
		() => store.createActions(dispatch, storage),
		[store],
	);
	const value = useMemo(
		() => ({
			...state,
			...actions,
		}),
		[state, actions],
	);

	// Load persisted token on mount
	useEffect(() => {
		async function loadPersisted() {
			const persistedToken = await storage.loadItem(
				StorageKey.AuthToken,
			);
			const persistedUserId = await storage.loadItem(
				StorageKey.AuthUserId,
			);
			console.debug(
				'[AuthProvider] Loaded persisted token:',
				persistedToken,
			);
			actions.setToken(persistedToken, persistedUserId);
		}
		loadPersisted();
	}, [actions]);

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthStore<T = AuthStore>(
	selector?: (store: AuthStore) => T,
	// if selector is provided, return selected value, otherwise return entire store
): T {
	const ctx: AuthStore | null = useContext(AuthContext);
	if (!ctx) {
		throw new Error('Missing AuthProvider');
	}
	if (selector) {
		return selector(ctx);
	}
	return ctx as unknown as T;
}
