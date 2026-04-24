import { TestID } from '@enums/TestID';
import LoginScreen from '@screens/LoginScreen/LoginScreen';
import { StyleSheet, View } from 'react-native';

const AuthStack = () => {
	return (
		<View testID={TestID.AuthStack} style={styles.container}>
			<LoginScreen />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default AuthStack;
