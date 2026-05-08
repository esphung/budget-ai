import { DB } from '@op-engineering/op-sqlite';
import { AccountRepository } from '@repositories/AccountRepository';
import { BudgetRepository } from '@repositories/BudgetRepository';
import { CategoryRepository } from '@repositories/CategoryRepository';
import { TransactionRepository } from '@repositories/TransactionRepository';
import { ApiClient } from '@services/ApiClient';
import { ClearAccounts } from '@usecases/clearAccounts';
import { ClearBudgets } from '@usecases/clearBudgets';
import { ClearCategories } from '@usecases/clearCategories';
import { ClearTransactions } from '@usecases/clearTransactions';
import { dbLog } from '@utils/logUtils';
import { useEffect, useRef } from 'react';
import { DevSettings } from 'react-native';

/**
 * Dev-only helper for quickly clearing local financial tables.
 */
export const useDevDataReset = (db: DB, api: ApiClient) => {
	const hasRegisteredMenuItems = useRef(false);

	useEffect(() => {
		if (!__DEV__ || hasRegisteredMenuItems.current) {
			return;
		}

		hasRegisteredMenuItems.current = true;

		DevSettings.addMenuItem('Clear Transactions (Dev)', async () => {
			try {
				await new ClearTransactions(
					new TransactionRepository(db, null, api),
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

		DevSettings.addMenuItem('Clear Budgets (Dev)', async () => {
			try {
				await new ClearBudgets(new BudgetRepository(db)).execute();
				dbLog.debug('Dev menu cleared budgets');
			} catch (error) {
				dbLog.error('Failed to clear budgets from dev menu', error);
			}
		});

		DevSettings.addMenuItem('Clear Categories (Dev)', async () => {
			try {
				await new ClearCategories(
					new CategoryRepository(db),
				).execute();
				dbLog.debug('Dev menu cleared categories');
			} catch (error) {
				dbLog.error(
					'Failed to clear categories from dev menu',
					error,
				);
			}
		});
	}, [api, db]);
};
