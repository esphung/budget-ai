import { TestID } from '@enums/TestID';
import AppStack from '@navigation/AppStack/AppStack';
import AuthStack from '@navigation/AuthStack/AuthStack';
import styles from '@navigation/RootStack/RootStack.styles';
import { useApiClient } from '@providers/ApiClientProvider';
import { useAuthStore } from '@providers/AuthProvider';
import { OpenAiServiceProvider } from '@providers/OpenAiServiceProvider';
import { View } from 'react-native';

const RootStack = () => {
	const token = useAuthStore((s) => s.token);
	const apiClient = useApiClient();

	return (
		<View testID={TestID.RootStack} style={styles.container}>
			{token ? (
				<OpenAiServiceProvider apiClient={apiClient}>
					<AppStack />
				</OpenAiServiceProvider>
			) : (
				<AuthStack />
			)}
		</View>
	);
};

export default RootStack;
