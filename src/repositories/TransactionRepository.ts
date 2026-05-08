import { notifyTableChanged } from '@db/databaseChangeNotifier';
import { executeTransaction } from '@db/executeTransaction';
import { DB, Scalar } from '@op-engineering/op-sqlite';
import { ApiClient, type ApiError } from '@services/ApiClient';
import { nowIso } from '@utils/dateUtil';
import { repositoryLog } from '@utils/logUtils';
import { generateUniqueId } from '@utils/randomIdUtils';
import type { Repository } from 'types/Repository';
import { NewTransactionInput, Transaction } from 'types/Transaction';

function isDuplicateTransactionIdError(
	error: ApiError | undefined,
): boolean {
	if (!error) {
		return false;
	}

	if (error.status === 409) {
		return true;
	}

	const message = (error.message ?? '').toLowerCase();
	return (
		error.status === 400 &&
		message.includes('unique constraint failed') &&
		message.includes('transactions.id')
	);
}

export class TransactionRepository
	implements Repository<NewTransactionInput, Transaction>
{
	constructor(
		private db: DB,
		private userId: string | null = null,
		private api: ApiClient,
	) {}

	private async syncCreatedTransaction(transaction: Transaction) {
		try {
			await this.api.transactions.create({
				id: transaction.id,
				accountId: transaction.accountId,
				amount: transaction.amount,
				merchant: transaction.merchant,
				category: transaction.category,
				transactionType: transaction.transactionType,
				date: transaction.date,
				source: transaction.source,
				createdAt: transaction.createdAt,
			});
		} catch (error) {
			const apiError = error as ApiError;
			if (isDuplicateTransactionIdError(apiError)) {
				return;
			}

			console.warn(
				`[TransactionRepository] Failed to sync created transaction ${
					transaction.id
				} (${apiError?.status ?? 0}): ${
					apiError?.message ?? 'Unknown error'
				}`,
			);
		}
	}

	private async syncDeletedTransaction(id: string): Promise<void> {
		try {
			await this.api.transactions.delete(id);
		} catch (error) {
			const apiError = error as ApiError;
			if (apiError?.status !== 404) {
				console.warn(
					`[TransactionRepository] Failed to sync deleted transaction ${id}: ${
						apiError?.message ?? 'Unknown error'
					}`,
				);
			}
		}
	}

	private async syncClearedTransactions(): Promise<void> {
		try {
			await this.api.transactions.clear();
		} catch (error) {
			const apiError = error as ApiError;
			if (apiError?.status !== 404) {
				console.warn(
					`[TransactionRepository] Failed to sync cleared transactions: ${
						apiError?.message ?? 'Unknown error'
					}`,
				);
			}
		}
	}

	delete: (id: string) => Promise<void> = async (_id) => {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		await this.syncDeletedTransaction(_id);

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
		const ownerId = this.userId ?? input.ownerId ?? null;

		await executeTransaction(this.db, [
			{
				sql: `
				INSERT INTO transactions (
					id,
					owner_id,
					account_id,
					amount,
					merchant,
					category,
					transaction_type,
					source,
					date,
					created_at,
					sync_status
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`,
				args: [
					id,
					ownerId,
					input.accountId ?? null,
					Math.abs(input.amount),
					merchant,
					category,
					input.transactionType,
					input.source,
					transactionDate,
					createdAt,
					'pending',
				],
			},
		]);
		notifyTableChanged('transactions');

		const transaction: Transaction = {
			id,
			ownerId,
			accountId: input.accountId ?? null,
			amount: Math.abs(input.amount),
			merchant,
			category,
			transactionType: input.transactionType,
			date: transactionDate,
			source: input.source,
			syncStatus: 'pending',
			createdAt,
		};

		await this.syncCreatedTransaction(transaction);

		return transaction;
	}

	async update(
		id: string,
		input: Partial<NewTransactionInput>,
	): Promise<Transaction> {
		const existingRows = await this.executeQuery<{
			id: string;
			owner_id: string | null;
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
				owner_id,
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
		const ownerId =
			input.ownerId === undefined
				? existing.owner_id
				: input.ownerId ?? null;
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
						date = ?,
						sync_status = ?
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
					'pending',
					id,
				],
			},
		]);
		notifyTableChanged('transactions');

		return {
			id: String(existing.id),
			ownerId,
			accountId,
			amount,
			merchant,
			category,
			transactionType,
			date,
			source: source as Transaction['source'],
			createdAt: String(existing.created_at),
			syncStatus: 'pending',
		};
	}

	async list(): Promise<Transaction[]> {
		repositoryLog.debug('Fetching all transactions');
		const ownerFilter = this.userId ? 'WHERE owner_id = ?' : '';
		const args = this.userId ? [this.userId] : [];
		const rows = await this.executeQuery<{
			id: string;
			owner_id: string | null;
			account_id: string | null;
			amount: number;
			merchant: string | null;
			category: string | null;
			transaction_type: 'expense' | 'income' | 'transfer';
			date: string | null;
			created_at: string;
			sync_status?: string;
			source?: string;
		}>(
			`
			SELECT
				id,
				owner_id,
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
			${ownerFilter}
			ORDER BY date DESC, created_at DESC
		`,
			args,
		);

		return rows.map((row) => ({
			id: String(row.id),
			ownerId: row.owner_id ? String(row.owner_id) : null,
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

		await this.syncClearedTransactions();

		const ownerFilter = this.userId ? 'WHERE owner_id = ?' : '';
		const args = this.userId ? [this.userId] : [];
		await executeTransaction(this.db, [
			{
				sql: `DELETE FROM transactions ${ownerFilter}`,
				args,
			},
		]);
		notifyTableChanged('transactions');
	}
}
