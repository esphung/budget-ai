import RootStack from '@navigation/RootStack/RootStack';
import { ApiClientProvider } from '@providers/ApiClientProvider';
import { AuthProvider } from '@providers/AuthProvider';
import { ApiClient } from '@services/ApiClient';
import { StorageService } from '@services/StorageService';
import { createAuthStore } from '@stores/AuthStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';

//  services
const apiClient = ApiClient.getInstance();
const authStorage = StorageService.getInstance('@budgetai_auth_token');

//  stores
const authStore = createAuthStore(authStorage);

const App = () => {
	return (
		<SafeAreaProvider>
			<ApiClientProvider apiClient={apiClient}>
				<AuthProvider store={authStore} storage={authStorage}>
					<RootStack />
				</AuthProvider>
			</ApiClientProvider>
		</SafeAreaProvider>
	);
};

export default App;
