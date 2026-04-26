import { TestID } from '@enums/TestID';
import TestScreen from '@screens/TestScreen/TestScreen';
import type { ApiClient } from '@services/ApiClient';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

const AppStack = ({ apiClient }: { apiClient: ApiClient }) => {
	return (
		<View testID={TestID.AppStack} style={styles.container}>
			<TestScreen apiClient={apiClient} />
		</View>
	);
};

export default AppStack;
