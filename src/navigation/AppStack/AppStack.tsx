import { TestID } from '@enums/TestID';
import HomeScreen from '@screens/HomeScreen/HomeScreen';
import { StyleSheet, View } from 'react-native';

const AppStack = () => {
	return (
		<View testID={TestID.AppStack} style={styles.container}>
			<HomeScreen />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default AppStack;
