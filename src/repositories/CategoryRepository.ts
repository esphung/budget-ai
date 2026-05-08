import { notifyTableChanged } from '@db/databaseChangeNotifier';
import { executeTransaction } from '@db/executeTransaction';
import { DB, Scalar } from '@op-engineering/op-sqlite';
import { ApiClient, type ApiError } from '@services/ApiClient';
import { nowIso } from '@utils/dateUtil';
import { generateUniqueId } from '@utils/randomIdUtils';
import type { Repository } from 'types/Repository';
import { Category, NewCategoryInput } from 'types/Category';

export class CategoryRepository
	implements Repository<NewCategoryInput, Category>
{
	constructor(
		private db: DB,
		private userId: string | null = null,
		private api: ApiClient,
	) {}

	private async syncCreatedCategory(category: Category): Promise<void> {
		try {
			await this.api.categories.create({
				id: category.id,
				name: category.name,
				color: category.color,
				icon: category.icon,
				createdAt: category.createdAt,
				updatedAt: category.updatedAt,
			});
		} catch (error) {
			console.warn(
				`[CategoryRepository] Failed to sync created category ${
					category.id
				}: ${(error as ApiError)?.message ?? 'Unknown error'}`,
			);
		}
	}

	private async syncUpdatedCategory(
		id: string,
		category: Category,
	): Promise<void> {
		try {
			await this.api.categories.update(id, {
				name: category.name,
				color: category.color,
				icon: category.icon,
				updatedAt: category.updatedAt,
			});
		} catch (error) {
			console.warn(
				`[CategoryRepository] Failed to sync updated category ${id}: ${
					(error as ApiError)?.message ?? 'Unknown error'
				}`,
			);
		}
	}

	private async syncDeletedCategory(id: string): Promise<void> {
		try {
			await this.api.categories.delete(id);
		} catch (error) {
			const apiError = error as ApiError;
			if (apiError?.status !== 404) {
				console.warn(
					`[CategoryRepository] Failed to sync deleted category ${id}: ${
						apiError?.message ?? 'Unknown error'
					}`,
				);
			}
		}
	}

	private async syncClearedCategories(): Promise<void> {
		try {
			await this.api.categories.clear();
		} catch (error) {
			const apiError = error as ApiError;
			if (apiError?.status !== 404) {
				console.warn(
					`[CategoryRepository] Failed to sync cleared categories: ${
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

	async create(input: NewCategoryInput): Promise<Category> {
		const id = generateUniqueId('cat');
		const now = nowIso();
		const name = input.name.trim();
		const color = input.color?.trim() || null;
		const icon = input.icon?.trim() || null;
		const ownerId = this.userId ?? input.ownerId ?? null;

		await this.db.execute(
			`
			INSERT INTO categories (
				id,
				owner_id,
				name,
				color,
				icon,
				created_at,
				updated_at
			)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`,
			[id, ownerId, name, color, icon, now, now],
		);
		notifyTableChanged('categories');

		const created: Category = {
			id,
			ownerId,
			name,
			color,
			icon,
			createdAt: now,
			updatedAt: now,
		};

		await this.syncCreatedCategory(created);

		return created;
	}

	async update(
		id: string,
		input: Partial<NewCategoryInput>,
	): Promise<Category> {
		const existing = await this.getById(id);
		if (!existing) {
			throw new Error('Category not found');
		}

		const now = nowIso();
		const name = input.name?.trim() ?? existing.name;
		const color =
			input.color === undefined
				? existing.color
				: input.color?.trim() || null;
		const icon =
			input.icon === undefined
				? existing.icon
				: input.icon?.trim() || null;

		await executeTransaction(this.db, [
			{
				sql: `
					UPDATE categories
					SET name = ?,
						color = ?,
						icon = ?,
						updated_at = ?
					WHERE id = ?
				`,
				args: [name, color, icon, now, id],
			},
		]);
		notifyTableChanged('categories');

		const updated: Category = {
			...existing,
			name,
			color,
			icon,
			updatedAt: now,
		};

		await this.syncUpdatedCategory(id, updated);

		return updated;
	}

	async delete(id: string): Promise<void> {
		await this.syncDeletedCategory(id);

		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM categories WHERE id = ?',
				args: [id],
			},
		]);
		notifyTableChanged('categories');
	}

	async list(): Promise<Category[]> {
		const ownerFilter = this.userId ? 'WHERE owner_id = ?' : '';
		const args = this.userId ? [this.userId] : [];
		const rows = await this.executeQuery<{
			id: string;
			owner_id: string | null;
			name: string;
			color: string | null;
			icon: string | null;
			created_at: string;
			updated_at: string;
		}>(
			`
			SELECT
				id,
				owner_id,
				name,
				color,
				icon,
				created_at,
				updated_at
			FROM categories
			${ownerFilter}
			ORDER BY name ASC
		`,
			args,
		);

		return rows.map((row) => ({
			id: String(row.id),
			ownerId: row.owner_id ? String(row.owner_id) : null,
			name: String(row.name),
			color: row.color ? String(row.color) : null,
			icon: row.icon ? String(row.icon) : null,
			createdAt: String(row.created_at),
			updatedAt: String(row.updated_at),
		}));
	}

	async clearAll(): Promise<void> {
		await this.syncClearedCategories();

		await executeTransaction(this.db, [
			{
				sql: 'DELETE FROM categories',
				args: [],
			},
		]);
		notifyTableChanged('categories');
	}

	private async getById(id: string): Promise<Category | null> {
		const ownerFilter = this.userId ? 'AND owner_id = ?' : '';
		const args = this.userId ? [id, this.userId] : [id];
		const rows = await this.executeQuery<{
			id: string;
			owner_id: string | null;
			name: string;
			color: string | null;
			icon: string | null;
			created_at: string;
			updated_at: string;
		}>(
			`
			SELECT
				id,
				owner_id,
				name,
				color,
				icon,
				created_at,
				updated_at
			FROM categories
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
			color: row.color ? String(row.color) : null,
			icon: row.icon ? String(row.icon) : null,
			createdAt: String(row.created_at),
			updatedAt: String(row.updated_at),
		};
	}
}
