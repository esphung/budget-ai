import { executeTransaction } from '@db/executeTransaction';
import { Account, NewAccountInput } from '@models/Account';
import { DB, Scalar } from '@op-engineering/op-sqlite';
import { generateUniqueId } from '@utils/randomIdUtils';
import type { Repository } from 'types/Repository';

const nowIso = () => new Date().toISOString();

export class AccountRepository
	implements Repository<NewAccountInput, Account>
{
	constructor(private db: DB) {}

	private async executeQuery<T>(
		query: string,
		args: Scalar[] = [],
	): Promise<T[]> {
		const result = await this.db.execute(query, args);
		return result.rows as T[];
	}

	async getAll(): Promise<Account[]> {
		const rows = await this.executeQuery<{
			id: string;
			name: string;
			account_type: string;
			currency: string;
			created_at: string;
			updated_at: string;
		}>(`
			SELECT
				id,
				name,
				account_type,
				currency,
				created_at,
				updated_at
			FROM accounts
			ORDER BY name ASC
		`);

		return rows.map((row) => ({
			id: String(row.id),
			name: String(row.name),
			accountType: row.account_type as Account['accountType'],
			currency: String(row.currency),
			createdAt: String(row.created_at),
			updatedAt: String(row.updated_at),
		}));
	}

	async create(input: NewAccountInput): Promise<Account> {
		const id = generateUniqueId('acct');
		const now = nowIso();
		const accountType = input.accountType ?? 'cash';
		const currency = input.currency ?? 'USD';

		await this.db.execute(
			`
			INSERT INTO accounts (
				id,
				name,
				account_type,
				currency,
				created_at,
				updated_at
			)
			VALUES (?, ?, ?, ?, ?, ?)
		`,
			[id, input.name.trim(), accountType, currency, now, now],
		);

		return {
			id,
			name: input.name.trim(),
			accountType,
			currency,
			createdAt: now,
			updatedAt: now,
		};
	}

	async ensureDefaultAccount(): Promise<Account> {
		const existing = await this.executeQuery<{
			id: string;
			name: string;
			account_type: string;
			currency: string;
			created_at: string;
			updated_at: string;
		}>(
			`
			SELECT
				id,
				name,
				account_type,
				currency,
				created_at,
				updated_at
			FROM accounts
			WHERE name = ?
			LIMIT 1
		`,
			['Cash'],
		);

		if (existing[0]) {
			const row = existing[0];
			return {
				id: String(row.id),
				name: String(row.name),
				accountType: row.account_type as Account['accountType'],
				currency: String(row.currency),
				createdAt: String(row.created_at),
				updatedAt: String(row.updated_at),
			};
		}

		return this.create({ name: 'Cash', accountType: 'cash' });
	}

	async clearAll(): Promise<void> {
		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM accounts',
				args: [],
			},
		]);
	}
}
