import { DB, Scalar } from '@op-engineering/op-sqlite';

export async function executeTransaction(
	db: DB,
	queries: Array<{ sql: string; args: Scalar[] }>,
) {
	await db.transaction(async (tx) => {
		for (const { sql, args } of queries) {
			await tx.execute(sql, args);
		}
	});
}
