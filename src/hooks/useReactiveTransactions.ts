import { DB } from '@op-engineering/op-sqlite';
import { useEffect, useState } from 'react';

export type TransactionRecord = {
	id: string;
	amount: number;
	merchant: string | null;
	category: string | null;
	transactionType: 'expense' | 'income' | 'transfer' | string;
	date: string;
	createdAt: string;
};

export function useReactiveTransactions(db: DB | null) {
	const [transactions, setTransactions] = useState<TransactionRecord[]>(
		[],
	);
	const [updateTrigger, setUpdateTrigger] = useState(0);

	useEffect(() => {
		if (!db) {
			return;
		}

		const fetchTransactions = async () => {
			try {
				const result = await db.execute(`
					SELECT
						id,
						amount,
						merchant,
						category,
						transaction_type as transactionType,
						date,
						created_at as createdAt
					FROM transactions
					ORDER BY date DESC, created_at DESC
				`);

				setTransactions(result.rows as TransactionRecord[]);
			} catch (error) {
				console.error('Error fetching transactions:', error);
				setTransactions([]);
			}
		};

		fetchTransactions();
	}, [db, updateTrigger]);

	useEffect(() => {
		if (!db) {
			return;
		}

		const unsubscribe = db.reactiveExecute({
			query: 'SELECT id FROM transactions ORDER BY created_at DESC LIMIT 1',
			arguments: [],
			fireOn: [{ table: 'transactions' }],
			callback: () => {
				setUpdateTrigger((prev) => prev + 1);
			},
		});

		return () => {
			unsubscribe?.();
		};
	}, [db]);

	return [...transactions];
}
