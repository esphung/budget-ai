import {
	type GenerateInsightsRequest,
	type PlaidBalance,
	type PlaidTransaction,
} from '@services/ApiClient';
import { type Insight } from '@models/Insight';
import type { Dispatch } from 'react';

// ── State & Action types ──────────────────────────────────────────────────────

export type InsightsState = {
	insights: Insight[];
	isLoading: boolean;
	error: string | null;
	lastFetchedAt: string | null;
};

export type InsightsActions = {
	fetchInsights: (
		transactions: PlaidTransaction[],
		balances: PlaidBalance[],
	) => Promise<void>;
	clearInsights: () => void;
};

export type InsightsStore = InsightsState & InsightsActions;

export type InsightsAction =
	| { type: 'FETCH_START' }
	| { type: 'FETCH_SUCCESS'; insights: Insight[]; fetchedAt: string }
	| { type: 'FETCH_ERROR'; error: string }
	| { type: 'CLEAR' };

// ── Factory ───────────────────────────────────────────────────────────────────

/** Minimal API surface the store depends on — keeps the factory testable. */
export interface InsightsApiClient {
	insights: {
		generate: (
			body: GenerateInsightsRequest,
		) => Promise<{ insights: Insight[] }>;
	};
}

export type InsightsStoreFactory = {
	getInitialState: () => InsightsState;
	reducer: (state: InsightsState, action: InsightsAction) => InsightsState;
	createActions: (dispatch: Dispatch<InsightsAction>) => InsightsActions;
};

/** How long a cached result is considered fresh before re-fetching. */
const CACHE_DURATION_MS = 15 * 60 * 1000;

export const createInsightsStore = (
	apiClient: InsightsApiClient,
): InsightsStoreFactory => {
	const initialState: InsightsState = {
		insights: [],
		isLoading: false,
		error: null,
		lastFetchedAt: null,
	};

	return {
		getInitialState() {
			return { ...initialState };
		},

		reducer(
			state: InsightsState,
			action: InsightsAction,
		): InsightsState {
			switch (action.type) {
				case 'FETCH_START':
					return { ...state, isLoading: true, error: null };
				case 'FETCH_SUCCESS':
					return {
						...state,
						isLoading: false,
						insights: action.insights,
						lastFetchedAt: action.fetchedAt,
					};
				case 'FETCH_ERROR':
					return {
						...state,
						isLoading: false,
						error: action.error,
					};
				case 'CLEAR':
					return { ...initialState };
			}
		},

		createActions(dispatch: Dispatch<InsightsAction>): InsightsActions {
			// Mirror of lastFetchedAt kept in the closure so caching logic can
			// run without needing direct access to the reducer state.
			let cachedFetchedAt: string | null = null;

			return {
				async fetchInsights(
					transactions: PlaidTransaction[],
					balances: PlaidBalance[],
				) {
					// Skip if a fresh result is already cached.
					if (cachedFetchedAt) {
						const ageMs =
							Date.now() - new Date(cachedFetchedAt).getTime();
						if (ageMs < CACHE_DURATION_MS) {
							return;
						}
					}

					dispatch({ type: 'FETCH_START' });
					try {
						const { insights } =
							await apiClient.insights.generate({
								transactions,
								balances,
							});
						const fetchedAt = new Date().toISOString();
						cachedFetchedAt = fetchedAt;
						dispatch({
							type: 'FETCH_SUCCESS',
							insights,
							fetchedAt,
						});
					} catch (err: unknown) {
						const message =
							err instanceof Error
								? err.message
								: 'Failed to generate insights';
						dispatch({ type: 'FETCH_ERROR', error: message });
					}
				},

				clearInsights() {
					cachedFetchedAt = null;
					dispatch({ type: 'CLEAR' });
				},
			};
		},
	};
};
