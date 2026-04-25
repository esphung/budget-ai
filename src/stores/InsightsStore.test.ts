import { createInsightsStore } from '@stores/InsightsStore';
import { type Insight } from '@models/Insight';

const mockInsight: Insight = {
	id: 'insight_1',
	type: 'spending',
	title: 'High dining spend',
	body: 'You spent a lot on dining this month.',
	severity: 'warning',
	generatedAt: '2024-04-25T00:00:00Z',
};

function makeMockApiClient(
	insights: Insight[] = [mockInsight],
	shouldThrow = false,
) {
	return {
		insights: {
			generate: jest.fn(async () => {
				if (shouldThrow) {
					throw new Error('AI service unavailable');
				}
				return { insights };
			}),
		},
	};
}

describe('InsightsStore', () => {
	it('initializes with empty state', () => {
		const store = createInsightsStore(makeMockApiClient());
		const state = store.getInitialState();

		expect(state.insights).toEqual([]);
		expect(state.isLoading).toBe(false);
		expect(state.error).toBeNull();
		expect(state.lastFetchedAt).toBeNull();
	});

	it('FETCH_START sets isLoading true and clears error', () => {
		const store = createInsightsStore(makeMockApiClient());
		const state = store.reducer(
			{ ...store.getInitialState(), error: 'previous error' },
			{ type: 'FETCH_START' },
		);

		expect(state.isLoading).toBe(true);
		expect(state.error).toBeNull();
	});

	it('FETCH_SUCCESS stores insights and sets lastFetchedAt', () => {
		const store = createInsightsStore(makeMockApiClient());
		const fetchedAt = '2024-04-25T00:00:00Z';
		const state = store.reducer(store.getInitialState(), {
			type: 'FETCH_SUCCESS',
			insights: [mockInsight],
			fetchedAt,
		});

		expect(state.isLoading).toBe(false);
		expect(state.insights).toEqual([mockInsight]);
		expect(state.lastFetchedAt).toBe(fetchedAt);
	});

	it('FETCH_ERROR stores error message and stops loading', () => {
		const store = createInsightsStore(makeMockApiClient());
		const state = store.reducer(
			{ ...store.getInitialState(), isLoading: true },
			{ type: 'FETCH_ERROR', error: 'Something went wrong' },
		);

		expect(state.isLoading).toBe(false);
		expect(state.error).toBe('Something went wrong');
	});

	it('CLEAR resets to initial state', () => {
		const store = createInsightsStore(makeMockApiClient());
		const populated = store.reducer(store.getInitialState(), {
			type: 'FETCH_SUCCESS',
			insights: [mockInsight],
			fetchedAt: '2024-04-25T00:00:00Z',
		});
		const cleared = store.reducer(populated, { type: 'CLEAR' });

		expect(cleared).toEqual(store.getInitialState());
	});

	it('fetchInsights dispatches FETCH_START then FETCH_SUCCESS on success', async () => {
		const apiClient = makeMockApiClient([mockInsight]);
		const store = createInsightsStore(apiClient);
		const dispatch = jest.fn();
		const actions = store.createActions(dispatch);

		await actions.fetchInsights([], []);

		expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_START' });
		expect(dispatch).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'FETCH_SUCCESS',
				insights: [mockInsight],
			}),
		);
		expect(apiClient.insights.generate).toHaveBeenCalledTimes(1);
	});

	it('fetchInsights dispatches FETCH_ERROR on API failure', async () => {
		const apiClient = makeMockApiClient([], true);
		const store = createInsightsStore(apiClient);
		const dispatch = jest.fn();
		const actions = store.createActions(dispatch);

		await actions.fetchInsights([], []);

		expect(dispatch).toHaveBeenCalledWith({ type: 'FETCH_START' });
		expect(dispatch).toHaveBeenCalledWith({
			type: 'FETCH_ERROR',
			error: 'AI service unavailable',
		});
	});

	it('fetchInsights skips API call when cache is fresh', async () => {
		const apiClient = makeMockApiClient([mockInsight]);
		const store = createInsightsStore(apiClient);
		const dispatch = jest.fn();
		const actions = store.createActions(dispatch);

		// First call populates the cache
		await actions.fetchInsights([], []);
		// Second call within the cache window should be a no-op
		await actions.fetchInsights([], []);

		expect(apiClient.insights.generate).toHaveBeenCalledTimes(1);
	});

	it('clearInsights dispatches CLEAR and invalidates cache', async () => {
		const apiClient = makeMockApiClient([mockInsight]);
		const store = createInsightsStore(apiClient);
		const dispatch = jest.fn();
		const actions = store.createActions(dispatch);

		// Warm cache
		await actions.fetchInsights([], []);
		dispatch.mockClear();
		apiClient.insights.generate.mockClear();

		// Clear should invalidate cache so the next fetch hits the API
		actions.clearInsights();
		expect(dispatch).toHaveBeenCalledWith({ type: 'CLEAR' });

		await actions.fetchInsights([], []);
		expect(apiClient.insights.generate).toHaveBeenCalledTimes(1);
	});
});
