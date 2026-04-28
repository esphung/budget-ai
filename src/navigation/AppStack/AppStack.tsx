import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@screens/HomeScreen/HomeScreen';
import SettingsScreen from '@screens/SettingsScreen/SettingsScreen';
import TestScreen from '@screens/TestScreen/TestScreen';

export enum AppStackScreens {
	Home = 'HomeScreen',
	Test = 'TestScreen',
	Settings = 'SettingsScreen',
}

export type AppStackParamList = {
	[AppStackScreens.Home]: undefined;
	[AppStackScreens.Test]: undefined;
	[AppStackScreens.Settings]: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList, 'AppStack'>();

const AppStack = () => {
	return (
		<Stack.Navigator
			id="AppStack"
			initialRouteName={AppStackScreens.Home}
			screenOptions={{ headerShown: false }}>
			<Stack.Screen
				name={AppStackScreens.Home}
				component={HomeScreen}
			/>
			<Stack.Screen
				name={AppStackScreens.Test}
				component={TestScreen}
			/>
			<Stack.Screen
				name={AppStackScreens.Settings}
				component={SettingsScreen} // TODO: Replace with actual SettingsScreen when implemented
			/>
		</Stack.Navigator>
	);
};

export default AppStack;
