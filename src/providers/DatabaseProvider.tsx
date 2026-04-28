import { DB } from '@op-engineering/op-sqlite';
import { dbLog } from '@utils/logUtils';
import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
} from 'react';
import { DevSettings } from 'react-native';

// Define the shape of the context state
type DatabaseStore = { db: DB | null; isInitializing: boolean };

// Create the context
const DatabaseContext = createContext<DatabaseStore | undefined>(undefined);

export const DatabaseProvider: React.FC<{
	children: ReactNode;
	db: DB | null;
}> = ({ children, db }) => {
	const [isInitializing, setIsInitializing] = React.useState(true);

	// add debug menu item to show database debug info - only in dev mode
	useEffect(() => {
		if (__DEV__) {
			DevSettings.addMenuItem(
				'Show DatabaseService Debug Info',
				() => {
					const debugInfo = {
						path: db?.getDbPath() || 'No DB instance',
						ready: !!db,
						isInitializing,
					};
					dbLog.debug('Print Database Debug:', debugInfo);
				},
			);
		}
	}, [db, isInitializing]);

	useEffect(() => {
		if (!isInitializing) return;
		if (db) {
			setIsInitializing(false);
		}
	}, [db, isInitializing]);

	return (
		<DatabaseContext.Provider value={{ db, isInitializing }}>
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
