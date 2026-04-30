import AppStack from '@navigation/AppStack/AppStack';
import AuthStack from '@navigation/AuthStack/AuthStack';
import { navigationRef } from '@navigation/navigationService';
import { useAuthStore } from '@providers/AuthProvider';
import { DatabaseProvider, useDatabase } from '@providers/DatabaseProvider';
import { NavigationContainer } from '@react-navigation/native';
import { DatabaseService } from '@services/DatabaseService';
import { useDevDataReset } from '@hooks/useDevDataReset';
import React from 'react';

const dbService = DatabaseService.getInstance('budgetai.db', 'default');

const DatabaseAppStack = () => {
	const { db } = useDatabase();

	useDevDataReset(db);

	return <AppStack />;
};

const RootStack = () => {
	const token = useAuthStore((s) => s.token);

	return (
		<NavigationContainer ref={navigationRef}>
			{token ? (
				<DatabaseProvider dbService={dbService}>
					<DatabaseAppStack />
				</DatabaseProvider>
			) : (
				<AuthStack />
			)}
		</NavigationContainer>
	);
};

export default RootStack;
