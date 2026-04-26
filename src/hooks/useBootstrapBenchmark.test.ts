import { useBootstrapBenchmark } from '@hooks/useBootstrapBenchmark';
import { benchmarkService } from '@services/BenchmarkService';
import { renderHook } from '@testing-library/react-native';

describe('useBootstrapBenchmark', () => {
	beforeEach(() => {
		benchmarkService.clear();
		jest.useFakeTimers();
	});

	afterAll(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	it('should start the bootstrap benchmark with a threshold', () => {
		renderHook(() => useBootstrapBenchmark());

		jest.advanceTimersByTime(100);

		benchmarkService.stop('bootstrap');

		const results = benchmarkService.getResults();
		expect(results).toHaveLength(1);
	});
});
