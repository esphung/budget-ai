import { DB } from '@op-engineering/op-sqlite';

export async function runAIMigrations(db: DB) {
	await db.transaction(async (tx) => {
		await tx.execute(`
      CREATE TABLE IF NOT EXISTS ai_threads (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

		await tx.execute(`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,

        role TEXT NOT NULL CHECK (
          role IN ('system', 'user', 'assistant', 'tool')
        ),

        message_type TEXT NOT NULL DEFAULT 'text' CHECK (
          message_type IN (
            'text',
            'action_request',
            'action_result',
            'error',
            'summary'
          )
        ),

        content TEXT,
        metadata_json TEXT,

        model TEXT,
        created_at TEXT NOT NULL,

        FOREIGN KEY (thread_id) REFERENCES ai_threads(id)
          ON DELETE CASCADE
      );
    `);

		await tx.execute(`
      CREATE TABLE IF NOT EXISTS ai_actions (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        message_id TEXT NOT NULL,

        action_type TEXT NOT NULL,
        payload_json TEXT NOT NULL,

        status TEXT NOT NULL DEFAULT 'pending' CHECK (
          status IN ('pending', 'applied', 'rejected', 'failed')
        ),

        result_json TEXT,
        error_message TEXT,

        created_at TEXT NOT NULL,
        applied_at TEXT,

        FOREIGN KEY (thread_id) REFERENCES ai_threads(id)
          ON DELETE CASCADE,

        FOREIGN KEY (message_id) REFERENCES ai_messages(id)
          ON DELETE CASCADE
      );
    `);

		await tx.execute(`
      CREATE INDEX IF NOT EXISTS idx_ai_messages_thread_created
      ON ai_messages(thread_id, created_at);
    `);

		await tx.execute(`
      CREATE INDEX IF NOT EXISTS idx_ai_actions_status
      ON ai_actions(status);
    `);

		await tx.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        merchant TEXT,
        category TEXT,
        transaction_type TEXT CHECK (
          transaction_type IN ('expense', 'income', 'transfer')
        ),
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
	});
}
