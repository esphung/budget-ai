import { Alert } from 'react-native';

export const navigateToScreen = (
	screenName: string,
	params?: Record<string, any>,
) => {
	// Implement your navigation logic here.
	// For example, if you're using React Navigation:
	// navigation.navigate(screenName, params);
	Alert.alert(
		`Navigate to ${screenName} with params: ${JSON.stringify(params)}`,
	);
};
