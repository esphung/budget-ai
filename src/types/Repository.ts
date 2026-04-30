export type Repository<K, T> = {
	create: (input: K) => Promise<T>;
	update: (id: string, input: Partial<K>) => Promise<T>;
	delete: (id: string) => Promise<void>;
	list: () => Promise<T[]>;
	clearAll: () => Promise<void>;
};
