import { useDevMenu } from '@hooks/useDevMenu';
import RootStack from '@navigation/RootStack/RootStack';
import { AuthProvider, useAuthStore } from '@providers/AuthProvider';
import { createAuthStore } from '@stores/AuthStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const authStore = createAuthStore();

const AppContent = () => {
	const store = useAuthStore();

	/* istanbul ignore next */
	useDevMenu({
		onLogout: store.logout,
		getDebugState: () => ({ token: store.token }),
	});

	return <RootStack />;
};

const App = () => {
	return (
		<SafeAreaProvider>
			<AuthProvider store={authStore}>
				<AppContent />
			</AuthProvider>
		</SafeAreaProvider>
	);
};

export default App;
