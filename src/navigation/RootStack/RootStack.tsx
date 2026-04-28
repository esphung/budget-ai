import { runAIMigrations } from '@db/runAIMigrations';
import AppStack from '@navigation/AppStack/AppStack';
import AuthStack from '@navigation/AuthStack/AuthStack';
import { navigationRef } from '@navigation/navigationService';
import { useAuthStore } from '@providers/AuthProvider';
import { DatabaseProvider } from '@providers/DatabaseProvider';
import { OpenAiServiceProvider } from '@providers/OpenAiServiceProvider';
import { NavigationContainer } from '@react-navigation/native';
import { DatabaseService } from '@services/DatabaseService';
import { dbLog } from '@utils/logUtils';
import { useEffect, useState } from 'react';

const dbService = DatabaseService.getInstance('budgetai.db', 'default');

const RootStack = () => {
	const token = useAuthStore((s) => s.token);

	const [db, setDb] = useState<DatabaseService['_db'] | null>(null);

	// mount DB and run migrations when it becomes available
	useEffect(() => {
		const onUpdate = async (update: DatabaseService['_db']) => {
			dbLog.debug('Received DB update in RootStack');
			setDb(update);

			if (!update) return;
			await runAIMigrations(update);
			dbLog.debug('DB migrations complete');
		};

		// subscribe to database updates
		dbService.addListener(onUpdate);

		// initialize the database (this will trigger the listener and run migrations)
		dbService.init();

		return () => {
			dbService.removeListener(onUpdate);
		};
	}, []);

	return (
		<NavigationContainer ref={navigationRef}>
			{token && db ? (
				<DatabaseProvider db={db}>
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
