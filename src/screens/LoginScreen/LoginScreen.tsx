import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import { useAuthStoreWithSelector } from '@providers/AuthProvider';
import { Button, StyleSheet, Text, View } from 'react-native';

const LoginScreen = () => {
	const setToken = useAuthStoreWithSelector((store) => store.setToken);

	return (
		<ThemedScreen>
			<View style={styles.content} testID={TestID.LoginScreen}>
				<Text style={styles.text}>
					Welcome to the Login Screen!
				</Text>
				<Button
					title="Login"
					onPress={() => setToken('authenticated')}
				/>
			</View>
		</ThemedScreen>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
		alignItems: 'center',
	},
	text: {
		fontSize: 18,
		marginBottom: 20,
	},
});

export default LoginScreen;
