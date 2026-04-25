import RootStack from '@navigation/RootStack/RootStack';
import { AuthProvider } from '@providers/AuthProvider';
import { InsightsProvider } from '@providers/InsightsProvider';
import { StorageService } from '@services/StorageService';
import { apiClient } from '@services/ApiClient';
import { createAuthStore } from '@stores/AuthStore';
import { createInsightsStore } from '@stores/InsightsStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';

//  services
const authStorage = StorageService.getInstance('@budgetai_auth_token');

//  stores
const authStore = createAuthStore(authStorage);
const insightsStore = createInsightsStore(apiClient);

const App = () => {
return (
<SafeAreaProvider>
<AuthProvider store={authStore} storage={authStorage}>
<InsightsProvider store={insightsStore}>
<RootStack />
</InsightsProvider>
</AuthProvider>
</SafeAreaProvider>
);
};

export default App;
