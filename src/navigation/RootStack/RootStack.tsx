import AppStack from '@navigation/AppStack/AppStack';
import AuthStack from '@navigation/AuthStack/AuthStack';
import { navigationRef } from '@navigation/navigationService';
import { useBackfillOwnerId } from '@hooks/useBackfillOwnerId';
import { useAuthStore } from '@providers/AuthProvider';
import { DatabaseProvider, useDatabase } from '@providers/DatabaseProvider';
import { useApiClient } from '@providers/ApiClientProvider';
import { NavigationContainer } from '@react-navigation/native';
import { DatabaseService } from '@services/DatabaseService';
import { SyncService } from '@services/SyncService';
import { useDevDataReset } from '@hooks/useDevDataReset';
import React, { useEffect } from 'react';

const dbService = DatabaseService.getInstance('budgetai.db', 'default');

const DatabaseAppStack = () => {
	const { db } = useDatabase();
	const { userId, token } = useAuthStore();
	const { api } = useApiClient();

	useDevDataReset(db, api);
	useBackfillOwnerId(db, userId);

	useEffect(() => {
		api.setAuthToken(token);
	}, [api, token]);

	useEffect(() => {
		if (!userId || !token) {
			return;
		}

		const controller = new AbortController();
		const syncService = new SyncService(db, api);

		syncService
			.probeEndpointAvailability(controller.signal)
			.then(() =>
				syncService.pullOwnerData(userId, controller.signal),
			)
			.catch((error) => {
				console.error(
					'[RootStack] Initial owner sync failed',
					error,
				);
			});

		return () => {
			controller.abort();
		};
	}, [api, db, token, userId]);

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
