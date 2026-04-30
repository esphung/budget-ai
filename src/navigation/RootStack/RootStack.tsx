import AppStack from '@navigation/AppStack/AppStack';
import AuthStack from '@navigation/AuthStack/AuthStack';
import { navigationRef } from '@navigation/navigationService';
import { useAuthStore } from '@providers/AuthProvider';
import { DatabaseProvider } from '@providers/DatabaseProvider';
import { NavigationContainer } from '@react-navigation/native';
import { DatabaseService } from '@services/DatabaseService';
import React from 'react';

const dbService = DatabaseService.getInstance('budgetai.db', 'default');

const RootStack = () => {
	const token = useAuthStore((s) => s.token);

	return (
		<NavigationContainer ref={navigationRef}>
			{token ? (
				<DatabaseProvider dbService={dbService}>
					<AppStack />
				</DatabaseProvider>
			) : (
				<AuthStack />
			)}
		</NavigationContainer>
	);
};

export default RootStack;
