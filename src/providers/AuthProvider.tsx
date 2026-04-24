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
}: {
	store: AuthStoreFactory;
	children: React.ReactNode;
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
