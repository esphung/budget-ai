import { executeTransaction } from '@db/executeTransaction';
import { NewTransactionInput, Transaction } from '@models/Transaction';
import { DB, Scalar } from '@op-engineering/op-sqlite';
import { repositoryLog } from '@utils/logUtils';
import { generateUniqueId } from '@utils/randomIdUtils';
import type { Repository } from 'types/Repository';

const nowIso = () => new Date().toISOString();

export class TransactionRepository
	implements Repository<NewTransactionInput, Transaction>
{
	constructor(private db: DB) {}

	private async executeQuery<T>(
		query: string,
		args: Scalar[] = [],
	): Promise<T[]> {
		repositoryLog.debug('Executing query', { query, args });
		const result = await this.db.execute(query, args);
		return result.rows as T[];
	}

	async create(input: NewTransactionInput): Promise<Transaction> {
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
					date,
					created_at
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			`,
				args: [
					id,
					input.accountId ?? null,
					Math.abs(input.amount),
					merchant,
					category,
					input.transactionType,
					transactionDate,
					createdAt,
				],
			},
		]);

		return {
			id,
			accountId: input.accountId ?? null,
			amount: Math.abs(input.amount),
			merchant,
			category,
			transactionType: input.transactionType,
			date: transactionDate,
			createdAt,
		};
	}

	async getAll(): Promise<Transaction[]> {
		repositoryLog.debug('Fetching all transactions');
		const rows = await this.executeQuery<{
			id: string;
			account_id: string | null;
			amount: number;
			merchant: string | null;
			category: string | null;
			transaction_type: string;
			date: string;
			created_at: string;
		}>(`
			SELECT
				id,
				account_id,
				amount,
				merchant,
				category,
				transaction_type,
				date,
				created_at
			FROM transactions
			ORDER BY date DESC, created_at DESC
		`);

		return rows.map((row) => ({
			id: String(row.id),
			accountId: row.account_id ? String(row.account_id) : null,
			amount: Number(row.amount),
			merchant: row.merchant ? String(row.merchant) : null,
			category: row.category ? String(row.category) : null,
			transactionType:
				row.transaction_type as Transaction['transactionType'],
			date: String(row.date),
			createdAt: String(row.created_at),
		}));
	}

	async clearAll(): Promise<void> {
		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM transactions',
				args: [],
			},
		]);
	}
}
