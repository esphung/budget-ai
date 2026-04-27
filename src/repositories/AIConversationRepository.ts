import {
	AIAction,
	AIActionStatus,
	AIMessage,
	AIMessageRole,
	AIMessageType,
} from '@db/types';
import { DB, Scalar } from '@op-engineering/op-sqlite';
import { generateUniqueId } from '@utils/randomIdUtils';

const nowIso = () => new Date().toISOString();

export class AIConversationRepository {
	constructor(private db: DB) {}

	private async executeQuery<T>(
		query: string,
		args: Scalar[],
	): Promise<T[]> {
		const result = await this.db.execute(query, args);
		return result.rows as T[];
	}

	private async executeTransaction(
		queries: Array<{ sql: string; args: Scalar[] }>,
	) {
		await this.db.transaction(async (tx) => {
			for (const { sql, args } of queries) {
				await tx.execute(sql, args);
			}
		});
	}

	async getOrCreateMainThread(): Promise<string> {
		const existing = await this.executeQuery<{ id: string }>(
			`
			SELECT id
			FROM ai_threads
			WHERE title = ?
			LIMIT 1
		`,
			['main'],
		);

		if (existing[0]?.id) {
			return existing[0].id;
		}

		const id = generateUniqueId('thrd_');
		const now = nowIso();

		await this.executeTransaction([
			{
				sql: `
				INSERT INTO ai_threads (
					id,
					title,
					created_at,
					updated_at
				)
				VALUES (?, ?, ?, ?)
			`,
				args: [id, 'main', now, now],
			},
		]);

		return id;
	}

	async saveMessage(input: {
		threadId: string;
		role: AIMessageRole;
		content?: string | null;
		messageType?: AIMessageType;
		metadata?: Record<string, unknown> | null;
		model?: string | null;
	}) {
		const id = generateUniqueId('msg_');
		const now = nowIso();

		await this.db.transaction(async (tx) => {
			await tx.execute(
				`
        INSERT INTO ai_messages (
          id,
          thread_id,
          role,
          message_type,
          content,
          metadata_json,
          model,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
				[
					id,
					input.threadId,
					input.role,
					input.messageType ?? 'text',
					input.content ?? null,
					input.metadata ? JSON.stringify(input.metadata) : null,
					input.model ?? null,
					now,
				],
			);

			await tx.execute(
				`
        UPDATE ai_threads
        SET updated_at = ?
        WHERE id = ?
        `,
				[now, input.threadId],
			);
		});

		return id;
	}

	async saveAction(input: {
		threadId: string;
		messageId: string;
		actionType: string;
		payload: Record<string, unknown>;
	}) {
		const id = generateUniqueId('act_');
		const now = nowIso();

		await this.db.transaction(async (tx) => {
			await tx.execute(
				`
        INSERT INTO ai_actions (
          id,
          thread_id,
          message_id,
          action_type,
          payload_json,
          status,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
				[
					id,
					input.threadId,
					input.messageId,
					input.actionType,
					JSON.stringify(input.payload),
					'pending',
					now,
				],
			);
		});

		return id;
	}

	async getMessages(threadId: string): Promise<AIMessage[]> {
		const result = await this.db.execute(
			`
      SELECT *
      FROM ai_messages
      WHERE thread_id = ?
      ORDER BY created_at ASC
      `,
			[threadId],
		);

		return result.rows.map((row) => ({
			id: String(row.id),
			threadId: String(row.thread_id),
			role: row.role as AIMessageRole,
			messageType: row.message_type as AIMessageType,
			content: row.content ? String(row.content) : null,
			metadata:
				row.metadata_json && typeof row.metadata_json === 'string'
					? JSON.parse(row.metadata_json)
					: null,
			model: row.model ? String(row.model) : null,
			createdAt: String(row.created_at),
		}));
	}

	async getPendingActions(threadId: string): Promise<AIAction[]> {
		const result = await this.db.execute(
			`
      SELECT *
      FROM ai_actions
      WHERE thread_id = ?
        AND status = 'pending'
      ORDER BY created_at ASC
      `,
			[threadId],
		);

		return result.rows.map((row) => ({
			id: String(row.id),
			threadId: String(row.thread_id),
			messageId: String(row.message_id),
			actionType: String(row.action_type),
			payload:
				row.payload_json && typeof row.payload_json === 'string'
					? JSON.parse(row.payload_json)
					: {},
			status: ['pending', 'applied', 'rejected', 'failed'].includes(
				String(row.status),
			)
				? (row.status as AIActionStatus)
				: 'pending',
			result:
				row.result_json && typeof row.result_json === 'string'
					? JSON.parse(row.result_json)
					: null,
			errorMessage: row.error_message
				? String(row.error_message)
				: null,
			createdAt: String(row.created_at),
			appliedAt: row.applied_at ? String(row.applied_at) : null,
		}));
	}

	async markActionApplied(input: {
		actionId: string;
		result?: Record<string, unknown>;
	}) {
		const now = nowIso();

		await this.db.transaction(async (tx) => {
			await tx.execute(
				`
        UPDATE ai_actions
        SET status = 'applied',
            result_json = ?,
            applied_at = ?
        WHERE id = ?
        `,
				[
					input.result ? JSON.stringify(input.result) : null,
					now,
					input.actionId,
				],
			);
		});
	}

	async markActionFailed(input: {
		actionId: string;
		errorMessage: string;
	}) {
		await this.db.transaction(async (tx) => {
			await tx.execute(
				`
        UPDATE ai_actions
        SET status = 'failed',
            error_message = ?
        WHERE id = ?
        `,
				[input.errorMessage, input.actionId],
			);
		});
	}
}
