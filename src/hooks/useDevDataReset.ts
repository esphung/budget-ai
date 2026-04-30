import { DB } from '@op-engineering/op-sqlite';
import { AccountRepository } from '@repositories/AccountRepository';
import { TransactionRepository } from '@repositories/TransactionRepository';
import { ClearAccounts } from '@usecases/clearAccounts';
import { ClearTransactions } from '@usecases/clearTransactions';
import { dbLog } from '@utils/logUtils';
import { useEffect, useRef } from 'react';
import { DevSettings } from 'react-native';

/**
 * Dev-only helper for quickly clearing local financial tables.
 */
export const useDevDataReset = (db: DB) => {
	const hasRegisteredMenuItems = useRef(false);

	useEffect(() => {
		if (!__DEV__ || hasRegisteredMenuItems.current) {
			return;
		}

		hasRegisteredMenuItems.current = true;

		DevSettings.addMenuItem('Clear Transactions (Dev)', async () => {
			try {
				await new ClearTransactions(
					new TransactionRepository(db),
				).execute();
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
				await new ClearAccounts(
					new AccountRepository(db),
				).execute();
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
