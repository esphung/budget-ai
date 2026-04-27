import HomeScreen from '@screens/HomeScreen/HomeScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestScreen from '@screens/TestScreen/TestScreen';

export enum AppStackScreens {
	Home = 'HomeScreen',
	Test = 'TestScreen',
}

export type AppStackParamList = {
	[AppStackScreens.Home]: undefined;
	[AppStackScreens.Test]: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList, 'AppStack'>();

const AppStack = () => {
	return (
		<Stack.Navigator
			id="AppStack"
			initialRouteName={AppStackScreens.Home}
			// screenOptions={{ headerShown: false }}
		>
			<Stack.Screen
				name={AppStackScreens.Home}
				component={HomeScreen}
			/>
			<Stack.Screen
				name={AppStackScreens.Test}
				component={TestScreen}
			/>
		</Stack.Navigator>
	);
};

export default AppStack;
