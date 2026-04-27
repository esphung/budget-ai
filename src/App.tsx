import { useBootstrapBenchmark } from '@hooks/useBootstrapBenchmark';
import { useDevMenu } from '@hooks/useDevMenu';
import RootStack from '@navigation/RootStack/RootStack';
import { ApiClientProvider } from '@providers/ApiClientProvider';
import { AuthProvider } from '@providers/AuthProvider';
import { FeatureFlagsProvider } from '@providers/FeatureFlagsProvider';
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
				<FeatureFlagsProvider
					initialFlags={{ newChatEnabled: true }}>
					<AuthProvider store={authStore}>
						<RootStack />
					</AuthProvider>
				</FeatureFlagsProvider>
			</ApiClientProvider>
		</SafeAreaProvider>
	);
};

export default App;
