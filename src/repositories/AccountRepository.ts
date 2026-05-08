import { notifyTableChanged } from '@db/databaseChangeNotifier';
import { executeTransaction } from '@db/executeTransaction';
import { Account, NewAccountInput } from 'types/Account';
import { DB, Scalar } from '@op-engineering/op-sqlite';
import { ApiClient, type ApiError } from '@services/ApiClient';
import { nowIso } from '@utils/dateUtil';
import { generateUniqueId } from '@utils/randomIdUtils';
import type { Repository } from 'types/Repository';

export class AccountRepository
	implements Repository<NewAccountInput, Account>
{
	constructor(
		private db: DB,
		private userId: string | null = null,
		private api: ApiClient,
	) {}

	private async syncCreatedAccount(account: Account): Promise<void> {
		try {
			await this.api.accounts.create({
				id: account.id,
				name: account.name,
				accountType: account.accountType,
				currency: account.currency,
				createdAt: account.createdAt,
				updatedAt: account.updatedAt,
			});
		} catch (error) {
			console.warn(
				`[AccountRepository] Failed to sync created account ${
					account.id
				}: ${(error as ApiError)?.message ?? 'Unknown error'}`,
			);
		}
	}

	private async syncUpdatedAccount(
		id: string,
		account: Account,
	): Promise<void> {
		try {
			await this.api.accounts.update(id, {
				name: account.name,
				accountType: account.accountType,
				currency: account.currency,
				updatedAt: account.updatedAt,
			});
		} catch (error) {
			console.warn(
				`[AccountRepository] Failed to sync updated account ${id}: ${
					(error as ApiError)?.message ?? 'Unknown error'
				}`,
			);
		}
	}

	private async syncDeletedAccount(id: string): Promise<void> {
		try {
			await this.api.accounts.delete(id);
		} catch (error) {
			const apiError = error as ApiError;
			if (apiError?.status !== 404) {
				console.warn(
					`[AccountRepository] Failed to sync deleted account ${id}: ${
						apiError?.message ?? 'Unknown error'
					}`,
				);
			}
		}
	}

	private async syncClearedAccounts(): Promise<void> {
		try {
			await this.api.accounts.clear();
		} catch (error) {
			const apiError = error as ApiError;
			if (apiError?.status !== 404) {
				console.warn(
					`[AccountRepository] Failed to sync cleared accounts: ${
						apiError?.message ?? 'Unknown error'
					}`,
				);
			}
		}
	}

	getAll: () => Promise<Account[]> = async () => this.list();

	private async executeQuery<T>(
		query: string,
		args: Scalar[] = [],
	): Promise<T[]> {
		const result = await this.db.execute(query, args);
		return result.rows as T[];
	}

	async list(): Promise<Account[]> {
		const ownerFilter = this.userId ? 'WHERE owner_id = ?' : '';
		const args = this.userId ? [this.userId] : [];
		const rows = await this.executeQuery<{
			id: string;
			owner_id: string | null;
			name: string;
			account_type: string;
			currency: string;
			created_at: string;
			updated_at: string;
		}>(
			`
			SELECT
				id,
				owner_id,
				name,
				account_type,
				currency,
				created_at,
				updated_at
			FROM accounts
			${ownerFilter}
			ORDER BY name ASC
		`,
			args,
		);

		return rows.map((row) => ({
			id: String(row.id),
			ownerId: row.owner_id ? String(row.owner_id) : null,
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
		const ownerId = this.userId ?? input.ownerId ?? null;

		await this.db.execute(
			`
			INSERT INTO accounts (
				id,
				owner_id,
				name,
				account_type,
				currency,
				created_at,
				updated_at
			)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`,
			[
				id,
				ownerId,
				input.name.trim(),
				accountType,
				currency,
				now,
				now,
			],
		);
		notifyTableChanged('accounts');

		const created: Account = {
			id,
			ownerId,
			name: input.name.trim(),
			accountType,
			currency,
			createdAt: now,
			updatedAt: now,
		};

		await this.syncCreatedAccount(created);

		return created;
	}

	async update(
		id: string,
		input: Partial<NewAccountInput>,
	): Promise<Account> {
		const existing = await this.executeQuery<{
			id: string;
			owner_id: string | null;
			name: string;
			account_type: string;
			currency: string;
			created_at: string;
			updated_at: string;
		}>(
			`
			SELECT
				id,
				owner_id,
				name,
				account_type,
				currency,
				created_at,
				updated_at
			FROM accounts
			WHERE id = ?
			LIMIT 1
		`,
			[id],
		);

		if (!existing[0]) {
			throw new Error('Account not found');
		}

		const row = existing[0];
		const now = nowIso();
		const name = input.name?.trim() || String(row.name);
		const accountType =
			input.accountType ??
			(String(row.account_type) as Account['accountType']);
		const currency = input.currency ?? String(row.currency);
		const ownerId =
			input.ownerId === undefined
				? row.owner_id
				: input.ownerId ?? null;

		await executeTransaction(this.db, [
			{
				sql: `
					UPDATE accounts
					SET name = ?,
						account_type = ?,
						currency = ?,
						updated_at = ?
					WHERE id = ?
				`,
				args: [name, accountType, currency, now, id],
			},
		]);
		notifyTableChanged('accounts');

		const updated: Account = {
			id: String(row.id),
			ownerId,
			name,
			accountType,
			currency,
			createdAt: String(row.created_at),
			updatedAt: now,
		};

		await this.syncUpdatedAccount(id, updated);

		return updated;
	}

	async delete(id: string): Promise<void> {
		await this.syncDeletedAccount(id);

		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM accounts WHERE id = ?',
				args: [id],
			},
		]);
		notifyTableChanged('accounts');
	}

	async ensureDefaultAccount(): Promise<Account> {
		const ownerFilter = this.userId ? 'AND owner_id = ?' : '';
		const args = this.userId ? ['Cash', this.userId] : ['Cash'];
		const existing = await this.executeQuery<{
			id: string;
			owner_id: string | null;
			name: string;
			account_type: string;
			currency: string;
			created_at: string;
			updated_at: string;
		}>(
			`
			SELECT
				id,
				owner_id,
				name,
				account_type,
				currency,
				created_at,
				updated_at
			FROM accounts
			WHERE name = ?
			${ownerFilter}
			LIMIT 1
		`,
			args,
		);

		if (existing[0]) {
			const row = existing[0];
			return {
				id: String(row.id),
				ownerId: row.owner_id ? String(row.owner_id) : null,
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
		await this.syncClearedAccounts();

		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM accounts',
				args: [],
			},
		]);
		notifyTableChanged('accounts');
	}
}
