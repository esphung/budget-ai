import { runAIMigrations } from '@db/runAIMigrations';
import { DB } from '@op-engineering/op-sqlite';
import { DatabaseService } from '@services/DatabaseService';
import { dbLog } from '@utils/logUtils';
import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';
import { DevSettings } from 'react-native';

// Define the shape of the context state
type DatabaseStore = { db: DB | null };

// Create the context
const DatabaseContext = createContext<DatabaseStore | undefined>(undefined);

const service = DatabaseService.getInstance('budgetai.db', 'default');

export const DatabaseProvider: React.FC<{
	children: ReactNode;
}> = ({ children }) => {
	const [db, setDb] = useState<DB | null>(null);

	const handleDbUpdate = useCallback(async (update: DB | null) => {
		dbLog.debug('Received DB update in provider');
		setDb(update);
		try {
			// if the update is null, it means the db is not ready yet, so we shouldn't run migrations
			if (!update) return;
			await runAIMigrations(update);
			dbLog.debug('DB migrations complete');
		} catch (error) {
			dbLog.error('Failed to run migrations:', error);
		}
	}, []);

	// listen for db updates and run migrations when it becomes available
	useEffect(() => {
		const onUpdate = async (update: DB | null) => {
			return handleDbUpdate(update);
		};

		// subscribe to database updates
		service.addListener(onUpdate);

		// initialize the database
		service.init();

		return () => {
			service.removeListener(onUpdate);
		};
	}, [handleDbUpdate]);

	// add debug menu item to show database debug info - only in dev mode
	useEffect(() => {
		if (__DEV__) {
			DevSettings.addMenuItem(
				'Show DatabaseService Debug Info',
				() => {
					dbLog.debug(
						'DatabaseService Debug Info:',
						service.getDebugInfo(),
					);
				},
			);
		}
	}, []);

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
