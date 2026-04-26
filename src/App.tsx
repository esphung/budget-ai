import { useBootstrapBenchmark } from '@hooks/useBootstrapBenchmark';
import { useDevMenu } from '@hooks/useDevMenu';
import RootStack from '@navigation/RootStack/RootStack';
import { ApiClientProvider } from '@providers/ApiClientProvider';
import { AuthProvider } from '@providers/AuthProvider';
import { ApiClient } from '@services/ApiClient';
import { createAuthStore } from '@stores/AuthStore';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

//  services
const apiClient = new ApiClient('http://localhost:3001');

//  stores
const authStore = createAuthStore();

const App = () => {
	useDevMenu();
	useBootstrapBenchmark();

	return (
		<SafeAreaProvider>
			<ApiClientProvider apiClient={apiClient}>
				<AuthProvider store={authStore}>
					<RootStack />
				</AuthProvider>
			</ApiClientProvider>
		</SafeAreaProvider>
	);
};

export default App;
