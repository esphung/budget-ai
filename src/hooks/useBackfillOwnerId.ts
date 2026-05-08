import { notifyTableChanged } from '@db/databaseChangeNotifier';
import { executeTransaction } from '@db/executeTransaction';
import { DB } from '@op-engineering/op-sqlite';
import { useEffect, useRef } from 'react';

/**
 * Backfills owner_id for pre-existing local records.
 * Safe to run multiple times because it only touches NULL owner_id values.
 */
export function useBackfillOwnerId(db: DB, userId: string | null): void {
	const lastBackfilledUserId = useRef<string | null>(null);

	useEffect(() => {
		if (!userId) {
			return;
		}

		if (lastBackfilledUserId.current === userId) {
			return;
		}

		let isCancelled = false;

		const runBackfill = async () => {
			try {
				await executeTransaction(db, [
					{
						sql: 'UPDATE transactions SET owner_id = ? WHERE owner_id IS NULL',
						args: [userId],
					},
					{
						sql: 'UPDATE accounts SET owner_id = ? WHERE owner_id IS NULL',
						args: [userId],
					},
					{
						sql: 'UPDATE categories SET owner_id = ? WHERE owner_id IS NULL',
						args: [userId],
					},
					{
						sql: 'UPDATE budgets SET owner_id = ? WHERE owner_id IS NULL',
						args: [userId],
					},
				]);

				if (isCancelled) {
					return;
				}

				lastBackfilledUserId.current = userId;
				notifyTableChanged('transactions');
				notifyTableChanged('accounts');
				notifyTableChanged('categories');
				notifyTableChanged('budgets');
			} catch (error) {
				console.error('[useBackfillOwnerId] Failed to backfill owner_id', error);
			}
		};

		runBackfill();

		return () => {
			isCancelled = true;
		};
	}, [db, userId]);
}
