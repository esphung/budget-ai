import { StorageKey } from '@enums/StorageKey';
import AsyncStorage from '@react-native-async-storage/async-storage';

function createStorageKey(baseKey: string, key: StorageKey): string {
	return `${baseKey}-${key}`;
}

type StorageNamespace = '@auth' | '@preferences';

export class StorageService {
	private readonly storageKey: string;
	private static instances: Partial<
		Record<StorageNamespace, StorageService>
	> = {};

	static getInstance(key: StorageNamespace): StorageService {
		if (!StorageService.instances[key]) {
			StorageService.instances[key] = new StorageService(key);
		}

		return StorageService.instances[key] as StorageService;
	}

	private constructor(key: StorageNamespace) {
		this.storageKey = key;
	}

	async saveItem(value: string | null, key: StorageKey): Promise<void> {
		try {
			if (value) {
				await AsyncStorage.setItem(
					createStorageKey(this.storageKey, key),
					value,
				);
			} else {
				await AsyncStorage.removeItem(
					createStorageKey(this.storageKey, key),
				);
			}
		} catch (error) {
			console.error('[StorageService] Failed to save item:', error);
		}
	}

	async loadItem(key: StorageKey): Promise<string | null> {
		try {
			return await AsyncStorage.getItem(
				createStorageKey(this.storageKey, key),
			);
		} catch (error) {
			console.error('[StorageService] Failed to load item:', error);
			return null;
		}
	}

	async clearItem(key: StorageKey): Promise<void> {
		try {
			await AsyncStorage.removeItem(`${this.storageKey}-${key}`);
		} catch (error) {
			console.error('[StorageService] Failed to clear item:', error);
		}
	}
}
