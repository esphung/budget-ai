import { DB, open } from '@op-engineering/op-sqlite';
import { dbLog } from '@utils/logUtils';

export class DatabaseService {
	private _db: DB | null = null;
	private name: string;
	private location: string;
	private static instance: DatabaseService | null = null;
	private listeners: Set<(newDb: DB | null) => void> = new Set();

	getDb(): DB {
		if (!this._db) {
			throw new Error('DatabaseService is not initialized');
		}
		return this._db;
	}

	static getInstance(name: string, location: string): DatabaseService {
		if (!DatabaseService.instance) {
			DatabaseService.instance = new DatabaseService(name, location);
		}
		return DatabaseService.instance;
	}

	async init() {
		if (!this._db) {
			this._db = open({ name: this.name, location: this.location });
			dbLog.debug('DatabaseService initialized');
		}
		this.notifyListeners(this._db);
	}

	private constructor(name: string, location: string) {
		this.name = name;
		this.location = location;
	}

	private getDbPath(): string | undefined {
		if (!this._db) {
			dbLog.warn('Cannot get DB path: database is not initialized');
			return undefined;
		}
		return this._db.getDbPath();
	}

	addListener(listener: (_: DB | null) => void): void {
		this.listeners.add(listener);
	}

	removeListener(listener: (_: DB | null) => void): void {
		this.listeners.delete(listener);
	}

	private notifyListeners(update: DB | null): void {
		this.listeners.forEach((listener) => listener(update));
	}

	getDebugInfo(): Record<string, any> {
		return {
			name: this.name,
			location: this.location,
			dbPath: this.getDbPath(),
		};
	}
}
