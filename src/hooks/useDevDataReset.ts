import { DB } from '@op-engineering/op-sqlite';
import { AccountRepository } from '@repositories/AccountRepository';
import { TransactionRepository } from '@repositories/TransactionRepository';
import { dbLog } from '@utils/logUtils';
import { useEffect, useRef } from 'react';
import { DevSettings } from 'react-native';

/**
 * Dev-only helper for quickly clearing local financial tables.
 */
export const useDevDataReset = (db: DB | null) => {
	const hasRegisteredMenuItems = useRef(false);

	useEffect(() => {
		if (!__DEV__ || !db || hasRegisteredMenuItems.current) {
			return;
		}

		hasRegisteredMenuItems.current = true;

		DevSettings.addMenuItem('Clear Transactions (Dev)', async () => {
			try {
				await new TransactionRepository(db).clearAll();
				dbLog.debug('Dev menu cleared transactions');
			} catch (error) {
				dbLog.error(
					'Failed to clear transactions from dev menu',
					error,
				);
			}
		});

		DevSettings.addMenuItem('Clear Accounts (Dev)', async () => {
			try {
				await new AccountRepository(db).clearAll();
				dbLog.debug('Dev menu cleared accounts');
			} catch (error) {
				dbLog.error(
					'Failed to clear accounts from dev menu',
					error,
				);
			}
		});
	}, [db]);
};
