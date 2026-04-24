import { TestID } from '@enums/TestID';
import TestScreen from '@screens/TestScreen/TestScreen';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

const AppStack = () => {
	return (
		<View testID={TestID.AppStack} style={styles.container}>
			<TestScreen />
		</View>
	);
};

export default AppStack;
