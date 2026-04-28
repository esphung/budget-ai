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
	const balanceQuery = `
		SELECT COALESCE(
			SUM(
				CASE
					WHEN transaction_type = 'income' THEN ABS(amount)
					ELSE -ABS(amount)
				END
			),
			0
		) as total
		FROM transactions
	`;

	// Initial fetch and refetch when updates trigger
	useEffect(() => {
		if (!db) {
			return;
		}

		const fetchBalance = async () => {
			try {
				const result = await db.execute(balanceQuery);
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
	}, [balanceQuery, db, updateTrigger]);

	// Setup reactive listener to trigger refetches
	useEffect(() => {
		if (!db) {
			return;
		}

		const unsubscribe = db.reactiveExecute({
			query: balanceQuery,
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
	}, [db, balanceQuery]);

	return balance;
}
