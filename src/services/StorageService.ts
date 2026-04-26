import { StorageKey } from '@enums/StorageKey';
import AsyncStorage from '@react-native-async-storage/async-storage';

function createStorageKey(baseKey: string, key: StorageKey): string {
	return `${baseKey}-${key}`;
}

type StorageNamespace = '@auth';

export class StorageService {
	private readonly storageKey: string;
	private static instance: StorageService | null = null;

	static getInstance(key: StorageNamespace): StorageService {
		if (!StorageService.instance) {
			StorageService.instance = new StorageService(key);
		}
		return StorageService.instance;
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
