import {
	AppStackParamList,
	AppStackScreens,
} from '@navigation/AppStack/AppStack';
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef =
	createNavigationContainerRef<AppStackParamList>();

export function isSameScreen(screen: string): boolean {
	const currentScreen = NavigationService.getCurrentRouteName();
	const targetScreen = mapToAppStackScreen(screen);
	return currentScreen === targetScreen;
}

export const mapToAppStackScreen = (
	screen: any,
): AppStackScreens | null => {
	switch (screen) {
		case AppStackScreens.Home:
			return AppStackScreens.Home;
		case AppStackScreens.Test:
			return AppStackScreens.Test;
		case AppStackScreens.Settings:
			return AppStackScreens.Settings;
		case AppStackScreens.ManualTransaction:
			return AppStackScreens.ManualTransaction;
		default:
			console.warn(`Unknown screen requested: ${screen}`);
			return null;
	}
};

export class NavigationService {
	static goBack() {
		if (navigationRef.isReady() && navigationRef.canGoBack()) {
			navigationRef.goBack();
		}
	}

	static getCurrentRouteName(): AppStackScreens | null {
		if (navigationRef.isReady()) {
			const routeName = navigationRef.getCurrentRoute()?.name;
			return mapToAppStackScreen(routeName) || null;
		}
		return null;
	}
	static navigateToScreen<T extends undefined>(
		screenName: string,
		params?: T,
		resetStack = false,
	) {
		if (navigationRef.isReady()) {
			if (resetStack) {
				navigationRef.reset({
					index: 0,
					routes: [{ name: screenName, params }],
				});
				return;
			}
			navigationRef.navigate(
				screenName as keyof AppStackParamList,
				params,
			);
		}
	}
}
