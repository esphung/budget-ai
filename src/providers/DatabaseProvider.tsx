import { runAIMigrations } from '@db/runAIMigrations';
import { DB } from '@op-engineering/op-sqlite';
import { DatabaseService } from '@services/DatabaseService';
import { dbLog } from '@utils/logUtils';
import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
} from 'react';
import { DevSettings } from 'react-native';

// Define the shape of the context state
type DatabaseStore = { db: DB };

// Create the context
const DatabaseContext = createContext<DatabaseStore | undefined>(undefined);

export const DatabaseProvider: React.FC<{
	children: ReactNode;
	dbService: DatabaseService;
}> = ({ children, dbService }) => {
	const [db, setDb] = React.useState<DB | null>(null);

	useEffect(() => {
		const onUpdate = async (update: DB) => {
			await runAIMigrations(update);

			dbLog.debug('Received DB update in DatabaseProvider');
			setDb(update);
			dbLog.debug('Database instance updated in DatabaseProvider');
		};

		dbService.addListener(onUpdate);
		dbService.init();

		return () => {
			dbService.removeListener(onUpdate);
		};
	}, [dbService]);

	// Add a dev menu item to log database debug info
	useEffect(() => {
		if (__DEV__) {
			DevSettings.addMenuItem('Log Database Info', () => {
				const info = dbService.getDebugInfo();
				dbLog.debug(
					'Database Debug Info:',
					JSON.stringify(info, null, 2),
				);
			});
		}
	}, [dbService]);

	// If db is not ready yet, we can choose to render null or a loading state
	if (!db) {
		dbLog.debug('Database instance is not ready');
		return null;
	}

	return (
		<DatabaseContext.Provider value={{ db }}>
			{children}
		</DatabaseContext.Provider>
	);
};

// Custom hook for consuming the context
export function useDatabase<T = DatabaseStore>(
	selector?: (store: DatabaseStore) => T,
	// if selector is provided, return selected value, otherwise return entire store
): T {
	const ctx: DatabaseStore | undefined = useContext(DatabaseContext);
	if (!ctx) {
		throw new Error('Missing DatabaseProvider');
	}
	if (selector) {
		return selector(ctx);
	}
	return ctx as unknown as T;
}
