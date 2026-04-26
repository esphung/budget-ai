import { TestID } from '@enums/TestID';
import AppStack from '@navigation/AppStack/AppStack';
import AuthStack from '@navigation/AuthStack/AuthStack';
import styles from '@navigation/RootStack/RootStack.styles';
import { useAuthStoreWithSelector } from '@providers/AuthProvider';
import { View } from 'react-native';

const RootStack = () => {
	const token = useAuthStoreWithSelector((s) => s.token);

	return (
		<View testID={TestID.RootStack} style={styles.container}>
			{token ? <AppStack /> : <AuthStack />}
		</View>
	);
};

export default RootStack;
