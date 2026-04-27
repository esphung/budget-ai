import AppStack from '@navigation/AppStack/AppStack';
import AuthStack from '@navigation/AuthStack/AuthStack';
import { navigationRef } from '@navigation/navigationService';
import { useAuthStore } from '@providers/AuthProvider';
import { DatabaseProvider } from '@providers/DatabaseProvider';
import { OpenAiServiceProvider } from '@providers/OpenAiServiceProvider';
import { NavigationContainer } from '@react-navigation/native';

const RootStack = () => {
	const token = useAuthStore((s) => s.token);

	// return (
	// 	<View testID={TestID.RootStack} style={styles.container}>
	// 		{token ? (
	// 			<DatabaseProvider>
	// 				<OpenAiServiceProvider>
	// 					<AppStack />
	// 				</OpenAiServiceProvider>
	// 			</DatabaseProvider>
	// 		) : (
	// 			<AuthStack />
	// 		)}
	// 	</View>
	// );

	return (
		<NavigationContainer ref={navigationRef}>
			{token ? (
				<DatabaseProvider>
					<OpenAiServiceProvider>
						<AppStack />
					</OpenAiServiceProvider>
				</DatabaseProvider>
			) : (
				<AuthStack />
			)}
		</NavigationContainer>
	);
};

export default RootStack;
