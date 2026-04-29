export type Repository<K, T> = {
	getAll: () => Promise<T[]>;
	create: (input: K) => Promise<T>;
	clearAll: () => Promise<void>;
};
