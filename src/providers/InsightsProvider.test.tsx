import { createInsightsStore } from '@stores/InsightsStore';
import {
	renderHook,
	act as testAct,
} from '@testing-library/react-native';
import * as React from 'react';
import { InsightsProvider, useInsightsStore } from './InsightsProvider';
import { type Insight } from '@models/Insight';

const mockInsight: Insight = {
	id: 'insight_1',
	type: 'income',
	title: 'Payroll received',
	body: 'Your salary was deposited.',
	severity: 'positive',
	generatedAt: '2024-04-25T00:00:00Z',
};

function makeMockApiClient(insights: Insight[] = []) {
	return {
		insights: {
			generate: jest.fn(async () => ({ insights })),
		},
	};
}

describe('InsightsProvider', () => {
	it('provides store context with initial state', () => {
		const store = createInsightsStore(makeMockApiClient());
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<InsightsProvider store={store}>{children}</InsightsProvider>
		);

		const { result } = renderHook(() => useInsightsStore(), { wrapper });

		expect(result.current.insights).toEqual([]);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.error).toBeNull();
		expect(result.current.lastFetchedAt).toBeNull();
	});

	it('fetchInsights updates state with returned insights', async () => {
		const apiClient = makeMockApiClient([mockInsight]);
		const store = createInsightsStore(apiClient);
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<InsightsProvider store={store}>{children}</InsightsProvider>
		);

		const { result } = renderHook(() => useInsightsStore(), { wrapper });

		await testAct(async () => {
			await result.current.fetchInsights([], []);
		});

		expect(result.current.insights).toEqual([mockInsight]);
		expect(result.current.isLoading).toBe(false);
		expect(result.current.lastFetchedAt).not.toBeNull();
	});

	it('clearInsights resets state', async () => {
		const apiClient = makeMockApiClient([mockInsight]);
		const store = createInsightsStore(apiClient);
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<InsightsProvider store={store}>{children}</InsightsProvider>
		);

		const { result } = renderHook(() => useInsightsStore(), { wrapper });

		await testAct(async () => {
			await result.current.fetchInsights([], []);
		});

		expect(result.current.insights).toHaveLength(1);

		testAct(() => {
			result.current.clearInsights();
		});

		expect(result.current.insights).toEqual([]);
		expect(result.current.lastFetchedAt).toBeNull();
	});

	it('throws when called outside InsightsProvider', () => {
		const consoleErrorSpy = jest
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		expect(() => renderHook(() => useInsightsStore())).toThrow(
			'Missing InsightsProvider',
		);

		consoleErrorSpy.mockRestore();
	});
});
