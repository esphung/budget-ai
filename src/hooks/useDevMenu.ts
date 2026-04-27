import { useEffect } from 'react';
import { DevSettings } from 'react-native';
import { benchmarkService } from '@services/BenchmarkService';

/**
 * Adds a developer menu item to show benchmark results in development mode.
 */
export const useDevMenu = () => {
	useEffect(() => {
		if (!__DEV__) return;
		DevSettings.addMenuItem('Show Benchmarks', () => {
			console.log(
				`[DevMenu] Benchmark Results:\n${JSON.stringify(
					benchmarkService.getResults(),
					null,
					2,
				)}`,
			);
		});
	}, []);
};
