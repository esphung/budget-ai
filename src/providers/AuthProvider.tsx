import { StorageService } from '@services/StorageService';
import { type AuthStore, type AuthStoreFactory } from '@stores/AuthStore';
import React, {
	createContext,
	useContext,
	useMemo,
	useReducer,
} from 'react';

const AuthContext = createContext<AuthStore | null>(null);
AuthContext.displayName = 'AuthContext';

export function AuthProvider({
	store,
	children,
	storage,
}: {
	store: AuthStoreFactory;
	children: React.ReactNode;
	storage: StorageService;
}) {
	const [state, dispatch] = useReducer(
		store.reducer,
		store.getInitialState(),
	);
	const actions = useMemo(() => store.createActions(dispatch), [store]);
	const value = useMemo(
		() => ({
			...state,
			...actions,
		}),
		[state, actions],
	);

	// Load persisted token on mount
	React.useEffect(() => {
		async function loadPersisted() {
			const persistedToken = await storage.loadItem();
			console.debug(
				'[AuthProvider] Loaded persisted token:',
				persistedToken,
			);
			if (persistedToken) {
				actions.setToken(persistedToken);
			}
		}
		loadPersisted();
	}, [storage, actions]);

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthStoreWithSelector<T>(
	selector: (store: AuthStore) => T,
): T {
	return selector(useAuthStore());
}

export function useAuthStore() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error('Missing AuthProvider');
	}
	return ctx;
}
