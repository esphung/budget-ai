import { DB } from '@op-engineering/op-sqlite';
import { useEffect, useState } from 'react';

/**
 * Calculate total balance from the transactions table.
 * Sums all transaction amounts (income positive, expenses negative).
 * Reactive updates when transactions table changes.
 */
export function useTransactionBalance(db: DB | null): number {
	const [balance, setBalance] = useState<number>(0);
	const [updateTrigger, setUpdateTrigger] = useState<number>(0);

	// Initial fetch and refetch when updates trigger
	useEffect(() => {
		if (!db) {
			return;
		}

		const fetchBalance = async () => {
			try {
				const result = await db.execute(
					'SELECT COALESCE(SUM(amount), 0) as total FROM transactions',
				);
				const rows =
					(result.rows as Array<{ total: number }>) || [];
				const total = rows[0]?.total || 0;
				setBalance(total);
			} catch (error) {
				console.error('Error fetching balance:', error);
				setBalance(0);
			}
		};

		fetchBalance();
	}, [db, updateTrigger]);

	// Setup reactive listener to trigger refetches
	useEffect(() => {
		if (!db) {
			return;
		}

		const unsubscribe = db.reactiveExecute({
			query: 'SELECT COALESCE(SUM(amount), 0) as total FROM transactions',
			arguments: [],
			fireOn: [{ table: 'transactions' }],
			callback: () => {
				// Trigger a refetch by incrementing the trigger
				setUpdateTrigger((prev) => prev + 1);
			},
		});

		return () => {
			unsubscribe?.();
		};
	}, [db]);

	return balance;
}
