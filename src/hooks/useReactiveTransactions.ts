import { subscribeToTableChanges } from '@db/databaseChangeNotifier';
import { DB } from '@op-engineering/op-sqlite';
import { useEffect, useState } from 'react';

const TRANSACTIONS_QUERY = `
	SELECT
		id,
		account_id as accountId,
		amount,
		merchant,
		category,
		transaction_type as transactionType,
		date,
		created_at as createdAt
	FROM transactions
	ORDER BY date DESC, created_at DESC
`;

const LEGACY_TRANSACTIONS_QUERY = `
	SELECT
		id,
		NULL as accountId,
		amount,
		merchant,
		category,
		transaction_type as transactionType,
		date,
		created_at as createdAt
	FROM transactions
	ORDER BY date DESC, created_at DESC
`;

export type TransactionRecord = {
	id: string;
	accountId: string | null;
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
			setTransactions([]);
			return;
		}

		const fetchTransactions = async () => {
			try {
				const result = await db.execute(TRANSACTIONS_QUERY);

				setTransactions(result.rows as TransactionRecord[]);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				const isMissingAccountId =
					errorMessage.includes('no such column: account_id') ||
					errorMessage.includes('no such column: account_i');

				if (!isMissingAccountId) {
					console.error('Error fetching transactions:', error);
					setTransactions([]);
					return;
				}

				try {
					// Backward compatibility for existing databases before account_id migration.
					const fallbackResult = await db.execute(
						LEGACY_TRANSACTIONS_QUERY,
					);

					setTransactions(
						fallbackResult.rows as TransactionRecord[],
					);
				} catch (fallbackError) {
					console.error(
						'Error fetching transactions (fallback):',
						fallbackError,
					);
					setTransactions([]);
				}
			}
		};

		fetchTransactions();
	}, [db, updateTrigger]);

	useEffect(() => {
		const unsubscribe = subscribeToTableChanges('transactions', () => {
			setUpdateTrigger((prev) => prev + 1);
		});

		return unsubscribe;
	}, []);

	useEffect(() => {
		if (!db) {
			return;
		}

		const unsubscribe = db.reactiveExecute({
			query: TRANSACTIONS_QUERY,
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
