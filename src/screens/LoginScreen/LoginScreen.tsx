import Panel from '@components/Panel/Panel';
import PrimaryButton from '@components/PrimaryButton';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import { useAuthStore } from '@providers/AuthProvider';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const LoginScreen = () => {
	const setToken = useAuthStore((s) => s.setToken);

	const handleLogin = useMemo(() => {
		return () => {
			setToken('authenticated');
		};
	}, [setToken]);

	return (
		<ThemedScreen>
			<View style={styles.content} testID={TestID.LoginScreen}>
				<Panel type="north" style={styles.northPanel}>
					<Text style={styles.text}>Welcome to BudgetAI!</Text>
				</Panel>
				<Panel type="center" />
				<Panel type="south" style={styles.southPanel}>
					<PrimaryButton title="Login" onPress={handleLogin} />
				</Panel>
			</View>
		</ThemedScreen>
	);
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
	},
	northPanel: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	southPanel: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	text: {
		fontSize: 18,
		marginBottom: 20,
	},
});

export default LoginScreen;
