// src/services/BenchmarkService.ts

/**
 * Service to benchmark different flows in the application.
 */

export type BenchmarkResult = {
	label: string;
	elapsedTimeMs: number; // in milliseconds
};

export type BenchmarkLabel = 'bootstrap' | 'launchGreeting';

function roundMs(ms: number): number {
	return Math.round(ms);
}

class BenchmarkService {
	private benchmarks: Map<string, number> = new Map();
	private results: BenchmarkResult[] = [];
	private thresholds: Map<string, number> = new Map(); // Thresholds per label
	private runningBenchmarks: Set<string> = new Set(); // Track currently running benchmarks

	/**
	 * Sets a threshold for a specific benchmark label.
	 * @param label - Unique identifier for the flow being benchmarked.
	 * @param thresholdMs - Threshold in milliseconds for the benchmark.
	 */
	setThreshold(label: BenchmarkLabel, thresholdMs: number): void {
		this.thresholds.set(label, thresholdMs);
	}

	/**
	 * Starts a timer for the given label.
	 * @param label - Unique identifier for the flow being benchmarked.
	 */
	start(label: BenchmarkLabel, thresholdMs?: number): void {
		this.benchmarks.set(label, performance.now());
		this.runningBenchmarks.add(label);
		if (thresholdMs) {
			this.setThreshold(label, thresholdMs);
		}
	}

	/**
	 * Stops the timer for the given label and records the elapsed time.
	 * Logs a warning if the elapsed time exceeds the threshold for the label.
	 * @param label - Unique identifier for the flow being benchmarked.
	 */
	stop(label: BenchmarkLabel): void {
		const startTime = this.benchmarks.get(label);
		if (startTime !== undefined && this.runningBenchmarks.has(label)) {
			const elapsedTimeMs = performance.now() - startTime;
			this.results.push({ label, elapsedTimeMs });
			this.benchmarks.delete(label);

			// Check against label-specific threshold
			const thresholdMs = this.thresholds.get(label);
			if (thresholdMs !== undefined && elapsedTimeMs > thresholdMs) {
				console.warn(
					`Benchmark for label "${label}" exceeded threshold: ${elapsedTimeMs.toFixed(
						2,
					)} ms (Threshold: ${thresholdMs} ms)`,
				);
			}
		}
	}

	/**
	 * Returns an array of benchmarking results.
	 */
	getResults(
		label: BenchmarkLabel | null = null, // if label is provided, filter results by label
		options: { shouldFormat: boolean } = { shouldFormat: true }, // option to format elapsed time
	): BenchmarkResult[] {
		const { shouldFormat } = options;
		let filteredResults = this.results;
		if (label) {
			filteredResults = this.results.filter(
				(result) => result.label === label,
			);
		}
		// optionally format the results before returning
		if (shouldFormat) {
			// map to BenchmarkResult with formatted elapsed time
			return filteredResults.map((result) => ({
				label: result.label,
				elapsedTimeMs: roundMs(result.elapsedTimeMs),
			}));
		}
		return filteredResults;
	}

	/**
	 * Clears recorded benchmarks and results.
	 */
	clear(
		label?: BenchmarkLabel, // if label is provided, clear results for that label only
	): void {
		if (label) {
			this.results = this.results.filter(
				(result) => result.label !== label,
			);
			this.benchmarks.delete(label);
			this.thresholds.delete(label);
		} else {
			this.results = [];
			this.benchmarks.clear();
			this.thresholds.clear();
		}
	}

	isRunning(label: BenchmarkLabel): boolean {
		return this.runningBenchmarks.has(label);
	}
}

// create a singleton instance of BenchmarkService for each flow
export const benchmarkService = new BenchmarkService();
