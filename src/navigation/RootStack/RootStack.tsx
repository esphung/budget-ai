import { TestID } from '@enums/TestID';
import AppStack from '@navigation/AppStack/AppStack';
import AuthStack from '@navigation/AuthStack/AuthStack';
import styles from '@navigation/RootStack/RootStack.styles';
import { useAuthStoreWithSelector } from '@providers/AuthProvider';
import type { ApiClient } from '@services/ApiClient';
import { View } from 'react-native';

const RootStack = ({ apiClient }: { apiClient: ApiClient }) => {
	const token = useAuthStoreWithSelector((state) => state.token);

	return (
		<View testID={TestID.RootStack} style={styles.container}>
			{token ? <AppStack apiClient={apiClient} /> : <AuthStack />}
		</View>
	);
};

export default RootStack;
