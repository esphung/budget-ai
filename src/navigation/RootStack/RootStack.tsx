import { runAIMigrations } from '@db/runAIMigrations';
import { useDevDataReset } from '@hooks/useDevDataReset';
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
	useDevDataReset(db);

	// mount DB and run migrations when it becomes available
	useEffect(() => {
		const onUpdate = async (update: DatabaseService['_db']) => {
			dbLog.debug('Received DB update in RootStack');

			// if we don't have a DB instance yet or we removed the DB, set it immediately without running migrations
			if (!update) {
				setDb(update);
				return;
			}

			// run migrations on the new DB instance before setting it in state
			try {
				await runAIMigrations(update);
				dbLog.debug('DB migrations complete');
				setDb(update);
			} catch (error) {
				dbLog.error('DB migrations failed', error);
			}
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
