import {
	type InsightsStore,
	type InsightsStoreFactory,
} from '@stores/InsightsStore';
import React, {
	createContext,
	useContext,
	useMemo,
	useReducer,
} from 'react';

const InsightsContext = createContext<InsightsStore | null>(null);
InsightsContext.displayName = 'InsightsContext';

export function InsightsProvider({
	store,
	children,
}: {
	store: InsightsStoreFactory;
	children: React.ReactNode;
}) {
	const [state, dispatch] = useReducer(
		store.reducer,
		store.getInitialState(),
	);
	const actions = useMemo(
		() => store.createActions(dispatch),
		[store],
	);
	const value = useMemo(
		() => ({ ...state, ...actions }),
		[state, actions],
	);

	return (
		<InsightsContext.Provider value={value}>
			{children}
		</InsightsContext.Provider>
	);
}

export function useInsightsStoreWithSelector<T>(
	selector: (store: InsightsStore) => T,
): T {
	return selector(useInsightsStore());
}

export function useInsightsStore() {
	const ctx = useContext(InsightsContext);
	if (!ctx) {
		throw new Error('Missing InsightsProvider');
	}
	return ctx;
}
