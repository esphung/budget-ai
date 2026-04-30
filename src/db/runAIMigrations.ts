import type { DB } from '@op-engineering/op-sqlite';

export async function runAIMigrations(db: DB) {
	await db.transaction(async (tx) => {
		// ACCOUNTS TABLE
		await tx.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        account_type TEXT NOT NULL,
        currency TEXT NOT NULL DEFAULT 'USD',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

		// AI THREADS TABLE
		await tx.execute(`
      CREATE TABLE IF NOT EXISTS ai_threads (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

		// AI MESSAGES TABLE
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

		// AI ACTIONS TABLE
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

		// TRANSACTIONS TABLE
		await tx.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        account_id TEXT,
        amount REAL NOT NULL,
        merchant TEXT,
        category TEXT,
        transaction_type TEXT CHECK (
          transaction_type IN ('expense', 'income', 'transfer')
        ),
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        sync_status TEXT,
        source TEXT,
        FOREIGN KEY (account_id) REFERENCES accounts(id)
          ON DELETE SET NULL
      );
    `);

		// CATEGORIES TABLE
		await tx.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT,
        icon TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

		// BUDGETS TABLE
		await tx.execute(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        amount REAL NOT NULL,
        category_id TEXT,
        period_start TEXT NOT NULL,
        period_end TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE SET NULL
      );
    `);

		// INDEXES
		await tx.execute(`
      CREATE INDEX IF NOT EXISTS idx_ai_messages_thread_created
      ON ai_messages(thread_id, created_at);
    `);

		await tx.execute(`
      CREATE INDEX IF NOT EXISTS idx_ai_actions_status
      ON ai_actions(status);
    `);

		await tx.execute(`
      CREATE INDEX IF NOT EXISTS idx_accounts_name
      ON accounts(name);
    `);

		await tx.execute(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date
      ON transactions(date, created_at);
    `);

		await tx.execute(`
      CREATE INDEX IF NOT EXISTS idx_categories_name
      ON categories(name);
    `);

		await tx.execute(`
      CREATE INDEX IF NOT EXISTS idx_budgets_period
      ON budgets(period_start, period_end);
    `);
	});

	// Post-migration checks and adjustments
	const transactionColumns = await db.execute(
		'PRAGMA table_info(transactions)',
	);
	const hasTransactionColumn = (columnName: string) =>
		transactionColumns.rows.some(
			(row) => String(row.name) === columnName,
		);

	if (!hasTransactionColumn('account_id')) {
		await db.execute(
			'ALTER TABLE transactions ADD COLUMN account_id TEXT',
		);
	}

	if (!hasTransactionColumn('sync_status')) {
		await db.execute(
			'ALTER TABLE transactions ADD COLUMN sync_status TEXT',
		);
	}

	if (!hasTransactionColumn('source')) {
		await db.execute('ALTER TABLE transactions ADD COLUMN source TEXT');
	}

	await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_account_date
    ON transactions(account_id, date, created_at)
  `);
}
