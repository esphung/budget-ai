import { notifyTableChanged } from '@db/databaseChangeNotifier';
import { executeTransaction } from '@db/executeTransaction';
import { DB, Scalar } from '@op-engineering/op-sqlite';
import { ApiClient, type ApiError } from '@services/ApiClient';
import { nowIso } from '@utils/dateUtil';
import { generateUniqueId } from '@utils/randomIdUtils';
import type { Repository } from 'types/Repository';
import { Budget, NewBudgetInput } from 'types/Budget';

export class BudgetRepository
	implements Repository<NewBudgetInput, Budget>
{
	constructor(
		private db: DB,
		private userId: string | null = null,
		private api: ApiClient,
	) {}

	private async syncCreatedBudget(budget: Budget): Promise<void> {
		try {
			await this.api.budgets.create({
				id: budget.id,
				name: budget.name,
				amount: budget.amount,
				categoryId: budget.categoryId,
				periodStart: budget.periodStart,
				periodEnd: budget.periodEnd,
				createdAt: budget.createdAt,
				updatedAt: budget.updatedAt,
			});
		} catch (error) {
			console.warn(
				`[BudgetRepository] Failed to sync created budget ${
					budget.id
				}: ${(error as ApiError)?.message ?? 'Unknown error'}`,
			);
		}
	}

	private async syncUpdatedBudget(
		id: string,
		budget: Budget,
	): Promise<void> {
		try {
			await this.api.budgets.update(id, {
				name: budget.name,
				amount: budget.amount,
				categoryId: budget.categoryId,
				periodStart: budget.periodStart,
				periodEnd: budget.periodEnd,
				updatedAt: budget.updatedAt,
			});
		} catch (error) {
			console.warn(
				`[BudgetRepository] Failed to sync updated budget ${id}: ${
					(error as ApiError)?.message ?? 'Unknown error'
				}`,
			);
		}
	}

	private async syncDeletedBudget(id: string): Promise<void> {
		try {
			await this.api.budgets.delete(id);
		} catch (error) {
			const apiError = error as ApiError;
			if (apiError?.status !== 404) {
				console.warn(
					`[BudgetRepository] Failed to sync deleted budget ${id}: ${
						apiError?.message ?? 'Unknown error'
					}`,
				);
			}
		}
	}

	private async syncClearedBudgets(): Promise<void> {
		try {
			await this.api.budgets.clear();
		} catch (error) {
			const apiError = error as ApiError;
			if (apiError?.status !== 404) {
				console.warn(
					`[BudgetRepository] Failed to sync cleared budgets: ${
						apiError?.message ?? 'Unknown error'
					}`,
				);
			}
		}
	}

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
		const ownerId = this.userId ?? input.ownerId ?? null;

		await this.db.execute(
			`
			INSERT INTO budgets (
				id,
				owner_id,
				name,
				amount,
				category_id,
				period_start,
				period_end,
				created_at,
				updated_at
			)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		`,
			[
				id,
				ownerId,
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

		const created: Budget = {
			id,
			ownerId,
			name,
			amount: Math.abs(input.amount),
			categoryId: input.categoryId ?? null,
			periodStart: input.periodStart,
			periodEnd: input.periodEnd,
			createdAt: now,
			updatedAt: now,
		};

		await this.syncCreatedBudget(created);

		return created;
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

		const updated: Budget = {
			...existing,
			name,
			amount,
			categoryId,
			periodStart,
			periodEnd,
			updatedAt: now,
		};

		await this.syncUpdatedBudget(id, updated);

		return updated;
	}

	async delete(id: string): Promise<void> {
		await this.syncDeletedBudget(id);

		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM budgets WHERE id = ?',
				args: [id],
			},
		]);
		notifyTableChanged('budgets');
	}

	async list(): Promise<Budget[]> {
		const ownerFilter = this.userId ? 'WHERE owner_id = ?' : '';
		const args = this.userId ? [this.userId] : [];
		const rows = await this.executeQuery<{
			id: string;
			owner_id: string | null;
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
				owner_id,
				name,
				amount,
				category_id,
				period_start,
				period_end,
				created_at,
				updated_at
			FROM budgets
			${ownerFilter}
			ORDER BY period_start DESC, created_at DESC
		`,
			args,
		);

		return rows.map((row) => ({
			id: String(row.id),
			ownerId: row.owner_id ? String(row.owner_id) : null,
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
		await this.syncClearedBudgets();

		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM budgets',
				args: [],
			},
		]);
		notifyTableChanged('budgets');
	}

	private async getById(id: string): Promise<Budget | null> {
		const ownerFilter = this.userId ? 'AND owner_id = ?' : '';
		const args = this.userId ? [id, this.userId] : [id];
		const rows = await this.executeQuery<{
			id: string;
			owner_id: string | null;
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
				owner_id,
				name,
				amount,
				category_id,
				period_start,
				period_end,
				created_at,
				updated_at
			FROM budgets
			WHERE id = ?
			${ownerFilter}
			LIMIT 1
		`,
			args,
		);

		if (!rows[0]) {
			return null;
		}

		const row = rows[0];
		return {
			id: String(row.id),
			ownerId: row.owner_id ? String(row.owner_id) : null,
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
