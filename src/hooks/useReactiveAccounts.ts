import { subscribeToTableChanges } from '@db/databaseChangeNotifier';
import { Account } from 'types/Account';
import { DB } from '@op-engineering/op-sqlite';
import { useEffect, useMemo, useState } from 'react';

const ACCOUNTS_QUERY = `
	SELECT
		id,
		name,
		account_type as accountType,
		currency,
		created_at as createdAt,
		updated_at as updatedAt
	FROM accounts
	ORDER BY name ASC
`;

export function useReactiveAccounts(db: DB | null): Account[] {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [updateTrigger, setUpdateTrigger] = useState(0);

	useEffect(() => {
		if (!db) {
			setAccounts([]);
			return;
		}

		const fetchAccounts = async () => {
			try {
				const result = await db.execute(ACCOUNTS_QUERY);
				setAccounts(result.rows as Account[]);
			} catch (error) {
				console.error('Error fetching accounts:', error);
				setAccounts([]);
			}
		};

		fetchAccounts();
	}, [db, updateTrigger]);

	useEffect(() => {
		const unsubscribe = subscribeToTableChanges('accounts', () => {
			setUpdateTrigger((prev) => prev + 1);
		});

		return unsubscribe;
	}, []);

	useEffect(() => {
		if (!db) {
			return;
		}

		const unsubscribe = db.reactiveExecute({
			query: ACCOUNTS_QUERY,
			arguments: [],
			fireOn: [{ table: 'accounts' }],
			callback: () => {
				setUpdateTrigger((prev) => prev + 1);
			},
		});

		return () => {
			unsubscribe?.();
		};
	}, [db]);

	return useMemo(() => [...accounts], [accounts]);
}
