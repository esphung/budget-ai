import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import { useAuthStore } from '@providers/AuthProvider';
import { Button, StyleSheet, Text, View } from 'react-native';

const HomeScreen = () => {
	const { logout } = useAuthStore();
	return (
		<ThemedScreen>
			<View style={styles.content} testID={TestID.HomeScreen}>
				<Text style={styles.text}>Welcome to the Home Screen!</Text>
				<Button title="Logout" onPress={logout} />
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

export default HomeScreen;
