import { benchmarkService } from './BenchmarkService';

describe('BenchmarkService', () => {
	beforeEach(() => {
		benchmarkService.clear();
		jest.useFakeTimers(); // Enable fake timers for all tests
	});

	afterEach(() => {
		jest.useRealTimers(); // Restore real timers after each test
	});

	it('should start and stop a benchmark correctly', () => {
		benchmarkService.start('bootstrap');
		const delay = 100;
		jest.advanceTimersByTime(delay);
		benchmarkService.stop('bootstrap');

		const results = benchmarkService.getResults();
		expect(results).toHaveLength(1);
		expect(results[0].label).toBe('bootstrap');
		expect(results[0].elapsedTimeMs).toBeGreaterThanOrEqual(delay);
	});

	it('should clear all benchmarks', () => {
		benchmarkService.start('bootstrap');
		benchmarkService.stop('bootstrap');
		benchmarkService.clear();

		const results = benchmarkService.getResults();
		expect(results).toHaveLength(0);
	});

	it('should respect thresholds for specific labels', () => {
		console.warn = jest.fn();
		benchmarkService.setThreshold('bootstrap', 50);
		benchmarkService.start('bootstrap');
		jest.advanceTimersByTime(100);
		benchmarkService.stop('bootstrap');

		expect(console.warn).toHaveBeenCalledWith(
			expect.stringContaining('exceeded threshold'),
		);
	});

	it("should stop and restart a benchmark if it's already running", () => {
		console.warn = jest.fn();
		benchmarkService.start('bootstrap');
		jest.advanceTimersByTime(100);
		benchmarkService.start('bootstrap'); // Start again without stopping
		jest.advanceTimersByTime(100);
		benchmarkService.stop('bootstrap');

		const results = benchmarkService.getResults();
		expect(results).toHaveLength(1);
		expect(results[0].label).toBe('bootstrap');
		// should reflect the time from the second start, not the first
		expect(results[0].elapsedTimeMs).toBeGreaterThanOrEqual(100);
	});
});
