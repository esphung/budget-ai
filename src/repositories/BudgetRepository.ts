import { notifyTableChanged } from '@db/databaseChangeNotifier';
import { executeTransaction } from '@db/executeTransaction';
import { DB, Scalar } from '@op-engineering/op-sqlite';
import { nowIso } from '@utils/dateUtil';
import { generateUniqueId } from '@utils/randomIdUtils';
import type { Repository } from 'types/Repository';
import { Budget, NewBudgetInput } from 'types/Budget';

export class BudgetRepository
	implements Repository<NewBudgetInput, Budget>
{
	constructor(private db: DB) {}

	private async executeQuery<T>(
		query: string,
		args: Scalar[] = [],
	): Promise<T[]> {
		const result = await this.db.execute(query, args);
		return result.rows as T[];
	}

	async create(input: NewBudgetInput): Promise<Budget> {
		const id = generateUniqueId('bdgt');
		const now = nowIso();
		const name = input.name.trim();

		await this.db.execute(
			`
			INSERT INTO budgets (
				id,
				name,
				amount,
				category_id,
				period_start,
				period_end,
				created_at,
				updated_at
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`,
			[
				id,
				name,
				Math.abs(input.amount),
				input.categoryId ?? null,
				input.periodStart,
				input.periodEnd,
				now,
				now,
			],
		);
		notifyTableChanged('budgets');

		return {
			id,
			name,
			amount: Math.abs(input.amount),
			categoryId: input.categoryId ?? null,
			periodStart: input.periodStart,
			periodEnd: input.periodEnd,
			createdAt: now,
			updatedAt: now,
		};
	}

	async update(
		id: string,
		input: Partial<NewBudgetInput>,
	): Promise<Budget> {
		const existing = await this.getById(id);
		if (!existing) {
			throw new Error('Budget not found');
		}

		const now = nowIso();
		const name = input.name?.trim() ?? existing.name;
		const amount =
			input.amount === undefined
				? existing.amount
				: Math.abs(input.amount);
		const categoryId =
			input.categoryId === undefined
				? existing.categoryId
				: input.categoryId ?? null;
		const periodStart = input.periodStart ?? existing.periodStart;
		const periodEnd = input.periodEnd ?? existing.periodEnd;

		await executeTransaction(this.db, [
			{
				sql: `
					UPDATE budgets
					SET name = ?,
						amount = ?,
						category_id = ?,
						period_start = ?,
						period_end = ?,
						updated_at = ?
					WHERE id = ?
				`,
				args: [
					name,
					amount,
					categoryId,
					periodStart,
					periodEnd,
					now,
					id,
				],
			},
		]);
		notifyTableChanged('budgets');

		return {
			...existing,
			name,
			amount,
			categoryId,
			periodStart,
			periodEnd,
			updatedAt: now,
		};
	}

	async delete(id: string): Promise<void> {
		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM budgets WHERE id = ?',
				args: [id],
			},
		]);
		notifyTableChanged('budgets');
	}

	async list(): Promise<Budget[]> {
		const rows = await this.executeQuery<{
			id: string;
			name: string;
			amount: number;
			category_id: string | null;
			period_start: string;
			period_end: string;
			created_at: string;
			updated_at: string;
		}>(`
			SELECT
				id,
				name,
				amount,
				category_id,
				period_start,
				period_end,
				created_at,
				updated_at
			FROM budgets
			ORDER BY period_start DESC, created_at DESC
		`);

		return rows.map((row) => ({
			id: String(row.id),
			name: String(row.name),
			amount: Number(row.amount),
			categoryId: row.category_id ? String(row.category_id) : null,
			periodStart: String(row.period_start),
			periodEnd: String(row.period_end),
			createdAt: String(row.created_at),
			updatedAt: String(row.updated_at),
		}));
	}

	async clearAll(): Promise<void> {
		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM budgets',
				args: [],
			},
		]);
		notifyTableChanged('budgets');
	}

	private async getById(id: string): Promise<Budget | null> {
		const rows = await this.executeQuery<{
			id: string;
			name: string;
			amount: number;
			category_id: string | null;
			period_start: string;
			period_end: string;
			created_at: string;
			updated_at: string;
		}>(
			`
			SELECT
				id,
				name,
				amount,
				category_id,
				period_start,
				period_end,
				created_at,
				updated_at
			FROM budgets
			WHERE id = ?
			LIMIT 1
		`,
			[id],
		);

		if (!rows[0]) {
			return null;
		}

		const row = rows[0];
		return {
			id: String(row.id),
			name: String(row.name),
			amount: Number(row.amount),
			categoryId: row.category_id ? String(row.category_id) : null,
			periodStart: String(row.period_start),
			periodEnd: String(row.period_end),
			createdAt: String(row.created_at),
			updatedAt: String(row.updated_at),
		};
	}
}
