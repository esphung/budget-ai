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

export function useReactiveAccounts(
	db: DB | null,
	ownerId: string | null = null,
): Account[] {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [updateTrigger, setUpdateTrigger] = useState(0);

	useEffect(() => {
		if (!db) {
			setAccounts([]);
			return;
		}

		const fetchAccounts = async () => {
			try {
				const query = ownerId
					? `${ACCOUNTS_QUERY.trim().replace(
							'ORDER BY name ASC',
							'WHERE owner_id = ? ORDER BY name ASC',
					  )}`
					: ACCOUNTS_QUERY;
				const result = ownerId
					? await db.execute(query, [ownerId])
					: await db.execute(query);
				setAccounts(result.rows as Account[]);
			} catch (error) {
				console.error('Error fetching accounts:', error);
				setAccounts([]);
			}
		};

		fetchAccounts();
	}, [db, ownerId, updateTrigger]);

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

		const query = ownerId
			? `${ACCOUNTS_QUERY.trim().replace(
					'ORDER BY name ASC',
					'WHERE owner_id = ? ORDER BY name ASC',
			  )}`
			: ACCOUNTS_QUERY;
		const argumentsArray = ownerId ? [ownerId] : [];

		const unsubscribe = db.reactiveExecute({
			query,
			arguments: argumentsArray,
			fireOn: [{ table: 'accounts' }],
			callback: () => {
				setUpdateTrigger((prev) => prev + 1);
			},
		});

		return () => {
			unsubscribe?.();
		};
	}, [db, ownerId]);

	return useMemo(() => [...accounts], [accounts]);
}
