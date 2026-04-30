import { notifyTableChanged } from '@db/databaseChangeNotifier';
import { executeTransaction } from '@db/executeTransaction';
import { DB, Scalar } from '@op-engineering/op-sqlite';
import { nowIso } from '@utils/dateUtil';
import { repositoryLog } from '@utils/logUtils';
import { generateUniqueId } from '@utils/randomIdUtils';
import type { Repository } from 'types/Repository';
import { NewTransactionInput, Transaction } from 'types/Transaction';

export class TransactionRepository
	implements Repository<NewTransactionInput, Transaction>
{
	constructor(private db: DB) {}

	delete: (id: string) => Promise<void> = async (_id) => {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM transactions WHERE id = ?',
				args: [_id],
			},
		]);
		notifyTableChanged('transactions');
	};

	private async executeQuery<T>(
		query: string,
		args: Scalar[] = [],
	): Promise<T[]> {
		repositoryLog.debug('Executing query', { query, args });
		if (!this.db) {
			throw new Error('Database not initialized');
		}
		const result = await this.db.execute(query, args);
		return result.rows as T[];
	}

	async create(input: NewTransactionInput): Promise<Transaction> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}
		const id = generateUniqueId('txn');
		const createdAt = nowIso();
		const transactionDate = input.date ?? createdAt;
		const merchant = input.merchant?.trim() || null;
		const category = input.category?.trim() || null;

		await executeTransaction(this.db, [
			{
				sql: `
				INSERT INTO transactions (
					id,
					account_id,
					amount,
					merchant,
					category,
					transaction_type,
					source,
					date,
					created_at
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
			`,
				args: [
					id,
					input.accountId ?? null,
					Math.abs(input.amount),
					merchant,
					category,
					input.transactionType,
					input.source,
					transactionDate,
					createdAt,
				],
			},
		]);
		notifyTableChanged('transactions');

		return {
			id,
			accountId: input.accountId ?? null,
			amount: Math.abs(input.amount),
			merchant,
			category,
			transactionType: input.transactionType,
			date: transactionDate,
			source: input.source,
			createdAt,
		};
	}

	async update(
		id: string,
		input: Partial<NewTransactionInput>,
	): Promise<Transaction> {
		const existingRows = await this.executeQuery<{
			id: string;
			account_id: string | null;
			amount: number;
			merchant: string | null;
			category: string | null;
			transaction_type: 'expense' | 'income' | 'transfer';
			date: string;
			source: string | null;
			created_at: string;
			sync_status: string | null;
		}>(
			`
			SELECT
				id,
				account_id,
				amount,
				merchant,
				category,
				transaction_type,
				date,
				source,
				created_at,
				sync_status
			FROM transactions
			WHERE id = ?
			LIMIT 1
		`,
			[id],
		);

		if (!existingRows[0]) {
			throw new Error('Transaction not found');
		}

		const existing = existingRows[0];
		const accountId =
			input.accountId === undefined
				? existing.account_id
				: input.accountId ?? null;
		const amount =
			input.amount === undefined
				? Number(existing.amount)
				: Math.abs(input.amount);
		const merchant =
			input.merchant === undefined
				? existing.merchant
				: input.merchant?.trim() || null;
		const category =
			input.category === undefined
				? existing.category
				: input.category?.trim() || null;
		const transactionType =
			input.transactionType ?? existing.transaction_type;
		const source = input.source ?? existing.source ?? 'manual';
		const date = input.date ?? existing.date;

		await executeTransaction(this.db, [
			{
				sql: `
					UPDATE transactions
					SET account_id = ?,
						amount = ?,
						merchant = ?,
						category = ?,
						transaction_type = ?,
						source = ?,
						date = ?
					WHERE id = ?
				`,
				args: [
					accountId,
					amount,
					merchant,
					category,
					transactionType,
					source,
					date,
					id,
				],
			},
		]);
		notifyTableChanged('transactions');

		return {
			id: String(existing.id),
			accountId,
			amount,
			merchant,
			category,
			transactionType,
			date,
			source: source as Transaction['source'],
			createdAt: String(existing.created_at),
			syncStatus: existing.sync_status
				? (String(
						existing.sync_status,
				  ) as Transaction['syncStatus'])
				: 'synced',
		};
	}

	async list(): Promise<Transaction[]> {
		repositoryLog.debug('Fetching all transactions');
		const rows = await this.executeQuery<{
			id: string;
			account_id: string | null;
			amount: number;
			merchant: string | null;
			category: string | null;
			transaction_type: 'expense' | 'income' | 'transfer';
			date: string | null;
			created_at: string;
			sync_status?: string;
			source?: string;
		}>(`
			SELECT
				id,
				account_id,
				amount,
				merchant,
				category,
				transaction_type,
				date,
				created_at,
				sync_status,
				source
			FROM transactions
			ORDER BY date DESC, created_at DESC
		`);

		return rows.map((row) => ({
			id: String(row.id),
			accountId: row.account_id ? String(row.account_id) : null,
			amount: Number(row.amount),
			merchant: row.merchant ? String(row.merchant) : null,
			category: row.category ? String(row.category) : null,
			transactionType: row.transaction_type as
				| 'expense'
				| 'income'
				| 'transfer',
			date: String(row.date),
			createdAt: String(row.created_at),
			// TODO: fix these
			syncStatus: row.sync_status
				? (String(row.sync_status) as Transaction['syncStatus'])
				: 'synced',
			source: row.source
				? (String(row.source) as Transaction['source'])
				: 'manual',
		}));
	}

	async clearAll(): Promise<void> {
		if (!this.db) {
			throw new Error('Database not initialized');
		}
		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM transactions',
				args: [],
			},
		]);
		notifyTableChanged('transactions');
	}
}
