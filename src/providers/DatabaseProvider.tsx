import { runAIMigrations } from '@db/runAIMigrations';
import { DB } from '@op-engineering/op-sqlite';
import { DatabaseService } from '@services/DatabaseService';
import { dbLog } from '@utils/logUtils';
import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react';
import { DevSettings } from 'react-native';

// Define the shape of the context state
type OpSqlDbContextProps = {
	db: DB | null;
};

// Create the context
const OpSqlDbContext = createContext<OpSqlDbContextProps | undefined>(
	undefined,
);

const service = DatabaseService.getInstance('budgetai.db', 'default');

export const DatabaseProvider: React.FC<{
	children: ReactNode;
}> = ({ children }) => {
	const [db, setDb] = useState<DB | null>(null);

	// listen for db updates and run migrations when it becomes available
	useEffect(() => {
		const updateDb = async (update: DB | null) => {
			dbLog.debug('Received DB update');

			// update the db even if it's null so that consumers can react
			setDb(update);

			// if the update is null, it means the db is not ready yet, so we shouldn't run migrations
			if (!update) return;
			try {
				await runAIMigrations(update);
				dbLog.debug('DB migrations complete');
			} catch (error) {
				dbLog.error('Failed to run migrations:', error);
			}
		};

		service.addListener(updateDb);

		return () => {
			service.removeListener(updateDb);
		};
	}, []);

	// initialize the database on mount
	useEffect(() => {
		service.init();
	}, []);

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
		<OpSqlDbContext.Provider value={{ db }}>
			{children}
		</OpSqlDbContext.Provider>
	);
};

// Custom hook for consuming the context
export const useOpSqlDb = (): OpSqlDbContextProps => {
	const context = useContext(OpSqlDbContext);
	if (!context) {
		throw new Error(
			'useOpSqlDb must be used within an DatabaseProvider',
		);
	}
	return context;
};
