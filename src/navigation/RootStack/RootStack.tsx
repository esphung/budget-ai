import { TestID } from '@enums/TestID';
import AppStack from '@navigation/AppStack/AppStack';
import AuthStack from '@navigation/AuthStack/AuthStack';
import styles from '@navigation/RootStack/RootStack.styles';
import { useAuthStore } from '@providers/AuthProvider';
import { OpenAiServiceProvider } from '@providers/OpenAiServiceProvider';
import { DatabaseProvider } from '@providers/DatabaseProvider';
import { View } from 'react-native';

const RootStack = () => {
	const token = useAuthStore((s) => s.token);

	return (
		<View testID={TestID.RootStack} style={styles.container}>
			{token ? (
				<DatabaseProvider>
					<OpenAiServiceProvider>
						<AppStack />
					</OpenAiServiceProvider>
				</DatabaseProvider>
			) : (
				<AuthStack />
			)}
		</View>
	);
};

export default RootStack;
