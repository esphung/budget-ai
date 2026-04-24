import ThemedScreen from '@components/ThemedScreen';
import { TestID } from '@enums/TestID';
import { useAuthStore } from '@providers/AuthProvider';
import styles from '@screens/TestScreen/TestScreen.styles';
import { Button, Text, View } from 'react-native';

const TestScreen = () => {
	const { logout } = useAuthStore();

	return (
		<ThemedScreen>
			<View style={styles.container} testID={TestID.TestScreen}>
				<Text style={styles.text}>Welcome to the Test Screen!</Text>
				<Button title="Logout" onPress={logout} />
			</View>
		</ThemedScreen>
	);
};

export default TestScreen;
