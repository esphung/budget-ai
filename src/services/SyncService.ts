import { executeTransaction } from '@db/executeTransaction';
import { notifyTableChanged } from '@db/databaseChangeNotifier';
import { DB } from '@op-engineering/op-sqlite';
import { ApiClient, type ApiError } from '@services/ApiClient';
import { nowIso } from '@utils/dateUtil';

type UnknownRecord = Record<string, unknown>;
type SyncResource = 'transactions' | 'budgets' | 'accounts' | 'categories';

type SyncedTransaction = {
	id: string;
	ownerId: string;
	accountId: string | null;
	amount: number;
	merchant: string | null;
	category: string | null;
	transactionType: 'expense' | 'income' | 'transfer';
	date: string;
	createdAt: string;
	source: 'manual' | 'ai';
	syncStatus: 'synced';
};

type SyncedAccount = {
	id: string;
	ownerId: string;
	name: string;
	accountType: string;
	currency: string;
	createdAt: string;
	updatedAt: string;
};

type SyncedCategory = {
	id: string;
	ownerId: string;
	name: string;
	color: string | null;
	icon: string | null;
	createdAt: string;
	updatedAt: string;
};

type SyncedBudget = {
	id: string;
	ownerId: string;
	name: string;
	amount: number;
	categoryId: string | null;
	periodStart: string;
	periodEnd: string;
	createdAt: string;
	updatedAt: string;
};

type PendingTransactionRow = {
	id: string;
	owner_id: string | null;
	account_id: string | null;
	amount: number;
	merchant: string | null;
	category: string | null;
	transaction_type: 'expense' | 'income' | 'transfer';
	date: string;
	created_at: string;
	source: 'manual' | 'ai' | string | null;
	sync_status: string | null;
};

function asObject(input: unknown): UnknownRecord {
	return typeof input === 'object' && input !== null
		? (input as UnknownRecord)
		: {};
}

function asString(value: unknown, fallback = ''): string {
	if (typeof value === 'string') {
		return value;
	}
	if (typeof value === 'number' || typeof value === 'boolean') {
		return String(value);
	}
	return fallback;
}

function asNullableString(value: unknown): string | null {
	const normalized = asString(value).trim();
	return normalized ? normalized : null;
}

function asNumber(value: unknown, fallback = 0): number {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return value;
	}
	if (typeof value === 'string') {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}
	return fallback;
}

function asArray(payload: unknown): unknown[] {
	if (Array.isArray(payload)) {
		return payload;
	}
	const obj = asObject(payload);
	if (Array.isArray(obj.data)) {
		return obj.data;
	}
	if (Array.isArray(obj.items)) {
		return obj.items;
	}
	return [];
}

function isDuplicateTransactionIdError(error: ApiError | undefined): boolean {
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

async function fetchCollectionOrEmpty(
	resourceName: SyncResource,
	fetcher: (signal?: AbortSignal) => Promise<unknown>,
	signal?: AbortSignal,
): Promise<unknown[]> {
	try {
		const payload = await fetcher(signal);
		return asArray(payload);
	} catch (error) {
		const apiError = error as ApiError;

		if (apiError?.status === 404) {
			console.warn(
				`[SyncService] Skipping ${resourceName} sync because endpoint returned 404`,
			);
			return [];
		}

		throw error;
	}
}

async function fetchOptionalCollection(
	resourceName: Exclude<SyncResource, 'transactions'>,
	fetcher: (signal?: AbortSignal) => Promise<unknown>,
	signal?: AbortSignal,
): Promise<unknown[]> {
	try {
		const payload = await fetcher(signal);
		return asArray(payload);
	} catch (error) {
		const apiError = error as ApiError;
		const statusCode = apiError?.status ?? 0;
		const message = apiError?.message ?? 'Unknown error';

		console.warn(
			`[SyncService] Skipping ${resourceName} sync (${statusCode}): ${message}`,
		);
		return [];
	}
}

function normalizeTransaction(
	input: unknown,
	ownerId: string,
): SyncedTransaction | null {
	const row = asObject(input);
	const id = asString(row.id || row.transactionId).trim();
	if (!id) {
		return null;
	}

	const transactionTypeValue = asString(
		row.transactionType ?? row.transaction_type,
		'expense',
	);
	const transactionType: SyncedTransaction['transactionType'] =
		transactionTypeValue === 'income' ||
		transactionTypeValue === 'transfer'
			? transactionTypeValue
			: 'expense';

	const sourceValue = asString(row.source, 'manual');
	const source: SyncedTransaction['source'] =
		sourceValue === 'ai' ? 'ai' : 'manual';

	const createdAt = asString(row.createdAt ?? row.created_at, nowIso());
	const date = asString(row.date, createdAt);

	return {
		id,
		ownerId,
		accountId: asNullableString(row.accountId ?? row.account_id),
		amount: Math.abs(asNumber(row.amount, 0)),
		merchant: asNullableString(row.merchant),
		category: asNullableString(row.category),
		transactionType,
		date,
		createdAt,
		source,
		syncStatus: 'synced',
	};
}

function normalizeAccount(
	input: unknown,
	ownerId: string,
): SyncedAccount | null {
	const row = asObject(input);
	const id = asString(row.id || row.accountId).trim();
	if (!id) {
		return null;
	}

	const now = nowIso();
	return {
		id,
		ownerId,
		name: asString(row.name, 'Account').trim() || 'Account',
		accountType: asString(row.accountType ?? row.account_type, 'cash'),
		currency: asString(row.currency, 'USD'),
		createdAt: asString(row.createdAt ?? row.created_at, now),
		updatedAt: asString(row.updatedAt ?? row.updated_at, now),
	};
}

function normalizeCategory(
	input: unknown,
	ownerId: string,
): SyncedCategory | null {
	const row = asObject(input);
	const id = asString(row.id || row.categoryId).trim();
	if (!id) {
		return null;
	}

	const now = nowIso();
	return {
		id,
		ownerId,
		name: asString(row.name, 'Category').trim() || 'Category',
		color: asNullableString(row.color),
		icon: asNullableString(row.icon),
		createdAt: asString(row.createdAt ?? row.created_at, now),
		updatedAt: asString(row.updatedAt ?? row.updated_at, now),
	};
}

function normalizeBudget(
	input: unknown,
	ownerId: string,
): SyncedBudget | null {
	const row = asObject(input);
	const id = asString(row.id || row.budgetId).trim();
	if (!id) {
		return null;
	}

	const now = nowIso();
	const createdAt = asString(row.createdAt ?? row.created_at, now);
	const updatedAt = asString(row.updatedAt ?? row.updated_at, createdAt);
	const periodStart = asString(
		row.periodStart ?? row.period_start,
		createdAt.slice(0, 10),
	);
	const periodEnd = asString(
		row.periodEnd ?? row.period_end,
		periodStart,
	);

	return {
		id,
		ownerId,
		name: asString(row.name, 'Budget').trim() || 'Budget',
		amount: Math.abs(asNumber(row.amount, 0)),
		categoryId: asNullableString(row.categoryId ?? row.category_id),
		periodStart,
		periodEnd,
		createdAt,
		updatedAt,
	};
}

async function mergeOwnerTransactions(
	db: DB,
	rows: SyncedTransaction[],
): Promise<void> {
	if (!rows.length) {
		return;
	}

	await executeTransaction(db, [
		...rows.map((row) => ({
			sql: `
				INSERT OR REPLACE INTO transactions (
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
				)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`,
			args: [
				row.id,
				row.ownerId,
				row.accountId,
				row.amount,
				row.merchant,
				row.category,
				row.transactionType,
				row.date,
				row.createdAt,
				row.syncStatus,
				row.source,
			],
		})),
	]);
}

async function mergeOwnerAccounts(
	db: DB,
	rows: SyncedAccount[],
): Promise<void> {
	if (!rows.length) {
		return;
	}

	await executeTransaction(db, [
		...rows.map((row) => ({
			sql: `
				INSERT OR REPLACE INTO accounts (
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
			args: [
				row.id,
				row.ownerId,
				row.name,
				row.accountType,
				row.currency,
				row.createdAt,
				row.updatedAt,
			],
		})),
	]);
}

async function mergeOwnerCategories(
	db: DB,
	rows: SyncedCategory[],
): Promise<void> {
	if (!rows.length) {
		return;
	}

	await executeTransaction(db, [
		...rows.map((row) => ({
			sql: `
				INSERT OR REPLACE INTO categories (
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
			args: [
				row.id,
				row.ownerId,
				row.name,
				row.color,
				row.icon,
				row.createdAt,
				row.updatedAt,
			],
		})),
	]);
}

async function mergeOwnerBudgets(
	db: DB,
	rows: SyncedBudget[],
): Promise<void> {
	if (!rows.length) {
		return;
	}

	await executeTransaction(db, [
		...rows.map((row) => ({
			sql: `
				INSERT OR REPLACE INTO budgets (
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
			args: [
				row.id,
				row.ownerId,
				row.name,
				row.amount,
				row.categoryId,
				row.periodStart,
				row.periodEnd,
				row.createdAt,
				row.updatedAt,
			],
		})),
	]);
}

export class SyncService {
	private static didLogEndpointProbe = false;

	constructor(private readonly db: DB, private readonly api: ApiClient) {}

	private async getPendingTransactions(
		ownerId: string,
	): Promise<PendingTransactionRow[]> {
		const result = await this.db.execute(
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
				source,
				sync_status
			FROM transactions
			WHERE owner_id = ?
				AND (sync_status = 'pending' OR sync_status IS NULL)
			ORDER BY created_at ASC
		`,
			[ownerId],
		);

		return result.rows as PendingTransactionRow[];
	}

	private async markTransactionsSynced(
		transactionIds: string[],
	): Promise<void> {
		if (!transactionIds.length) {
			return;
		}

		await executeTransaction(
			this.db,
			transactionIds.map((id) => ({
				sql: 'UPDATE transactions SET sync_status = ? WHERE id = ?',
				args: ['synced', id],
			})),
		);
	}

	private async pushPendingTransactions(
		ownerId: string,
		signal?: AbortSignal,
	): Promise<void> {
		const pending = await this.getPendingTransactions(ownerId);
		if (!pending.length) {
			return;
		}

		const syncedIds: string[] = [];

		for (const row of pending) {
			try {
				await this.api.transactions.create(
					{
						id: String(row.id),
						accountId: row.account_id
							? String(row.account_id)
							: null,
						amount: Math.abs(Number(row.amount)),
						merchant: row.merchant
							? String(row.merchant)
							: null,
						category: row.category
							? String(row.category)
							: null,
						transactionType: row.transaction_type,
						date: String(row.date),
						source: row.source === 'ai' ? 'ai' : 'manual',
						createdAt: String(row.created_at),
					},
					signal,
				);
				syncedIds.push(String(row.id));
			} catch (error) {
				const apiError = error as ApiError;
				if (isDuplicateTransactionIdError(apiError)) {
					// If server already has this id, treat as synced.
					syncedIds.push(String(row.id));
					continue;
				}

				console.warn(
					`[SyncService] Failed to push transaction ${String(
						row.id,
					)} (${apiError?.status ?? 0}): ${
						apiError?.message ?? 'Unknown error'
					}`,
				);
			}
		}

		await this.markTransactionsSynced(syncedIds);
	}

	private getResourceFetchers(): Array<{
		name: SyncResource;
		fetcher: (signal?: AbortSignal) => Promise<unknown>;
	}> {
		return [
			{ name: 'transactions', fetcher: this.api.transactions.list },
			{ name: 'budgets', fetcher: this.api.budgets.list },
			{ name: 'accounts', fetcher: this.api.accounts.list },
			{ name: 'categories', fetcher: this.api.categories.list },
		];
	}

	async probeEndpointAvailability(signal?: AbortSignal): Promise<void> {
		if (SyncService.didLogEndpointProbe) {
			return;
		}

		const resources = this.getResourceFetchers();
		const checks = await Promise.allSettled(
			resources.map(async ({ name, fetcher }) => {
				await fetcher(signal);
				return { name, status: 'ok' as const };
			}),
		);

		const summary = checks.map((check, index) => {
			const name = resources[index].name;
			if (check.status === 'fulfilled') {
				return `${name}:ok`;
			}

			const apiError = check.reason as ApiError;
			const statusCode = apiError?.status ?? 0;
			return `${name}:${statusCode}`;
		});

		console.info(`[SyncService] Endpoint probe ${summary.join(', ')}`);
		SyncService.didLogEndpointProbe = true;
	}

	async pullOwnerData(
		ownerId: string,
		signal?: AbortSignal,
	): Promise<void> {
		await this.pushPendingTransactions(ownerId, signal);

		const resources = this.getResourceFetchers();
		const transactionsResponse = await fetchCollectionOrEmpty(
			'transactions',
			resources[0].fetcher,
			signal,
		);

		const [budgetsResponse, accountsResponse, categoriesResponse] =
			await Promise.all([
				fetchOptionalCollection(
					'budgets',
					resources[1].fetcher,
					signal,
				),
				fetchOptionalCollection(
					'accounts',
					resources[2].fetcher,
					signal,
				),
				fetchOptionalCollection(
					'categories',
					resources[3].fetcher,
					signal,
				),
			]);

		const transactions = transactionsResponse
			.map((row) => normalizeTransaction(row, ownerId))
			.filter((row): row is SyncedTransaction => Boolean(row));
		const budgets = budgetsResponse
			.map((row) => normalizeBudget(row, ownerId))
			.filter((row): row is SyncedBudget => Boolean(row));
		const accounts = accountsResponse
			.map((row) => normalizeAccount(row, ownerId))
			.filter((row): row is SyncedAccount => Boolean(row));
		const categories = categoriesResponse
			.map((row) => normalizeCategory(row, ownerId))
			.filter((row): row is SyncedCategory => Boolean(row));

		// Offline-first merge strategy: upsert remote rows and never delete local rows on pull.
		await mergeOwnerAccounts(this.db, accounts);
		await mergeOwnerCategories(this.db, categories);
		await mergeOwnerBudgets(this.db, budgets);
		await mergeOwnerTransactions(this.db, transactions);

		notifyTableChanged('accounts');
		notifyTableChanged('categories');
		notifyTableChanged('budgets');
		notifyTableChanged('transactions');
	}
}
