import { benchmarkService } from '@services/BenchmarkService';
import { useEffect } from 'react';

export function useBootstrapBenchmark() {
	useEffect(() => {
		if (benchmarkService.isRunning('bootstrap')) {
			benchmarkService.stop('bootstrap');
		}
		benchmarkService.start('bootstrap', 500);
	}, []);
}
