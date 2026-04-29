import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@screens/HomeScreen/HomeScreen';
import ManualTransactionScreen from '@screens/ManualTransactionScreen/ManualTransactionScreen';
import SettingsScreen from '@screens/SettingsScreen/SettingsScreen';
import TestScreen from '@screens/TestScreen/TestScreen';

export enum AppStackScreens {
	Home = 'HomeScreen',
	Test = 'TestScreen',
	Settings = 'SettingsScreen',
	ManualTransaction = 'ManualTransactionScreen',
}

export type AppStackParamList = {
	[AppStackScreens.Home]: undefined;
	[AppStackScreens.Test]: undefined;
	[AppStackScreens.Settings]: undefined;
	[AppStackScreens.ManualTransaction]: undefined;
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
			<Stack.Screen
				name={AppStackScreens.ManualTransaction}
				component={ManualTransactionScreen}
			/>
		</Stack.Navigator>
	);
};

export default AppStack;
