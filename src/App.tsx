import { useDevMenu } from '@hooks/useDevMenu';
import RootStack from '@navigation/RootStack/RootStack';
import { ApiClientProvider } from '@providers/ApiClientProvider';
import { AuthProvider } from '@providers/AuthProvider';
import { FeatureFlagsProvider } from '@providers/FeatureFlagsProvider';
import { ThemeProvider } from '@providers/ThemeProvider';
import { benchmarkService } from '@services/BenchmarkService';
import { createAuthStore } from '@stores/AuthStore';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

//  stores
const authStore = createAuthStore();

// benchmark test for app startup => home screen mount
benchmarkService.start('bootstrap');

const App = () => {
	useDevMenu();

	return (
		<SafeAreaProvider>
			<ThemeProvider>
				<ApiClientProvider>
					<FeatureFlagsProvider>
						<AuthProvider store={authStore}>
							<RootStack />
						</AuthProvider>
					</FeatureFlagsProvider>
				</ApiClientProvider>
			</ThemeProvider>
		</SafeAreaProvider>
	);
};

export default App;
