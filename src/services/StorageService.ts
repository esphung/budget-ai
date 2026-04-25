import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
	private readonly storageKey: string;
	private static instance: StorageService | null = null;

	static getInstance(key: string): StorageService {
		if (!StorageService.instance) {
			StorageService.instance = new StorageService(key);
		}
		return StorageService.instance;
	}

	private constructor(key: string) {
		this.storageKey = key;
	}

	async saveItem(value: string | null): Promise<void> {
		try {
			if (value) {
				await AsyncStorage.setItem(this.storageKey, value);
			} else {
				await AsyncStorage.removeItem(this.storageKey);
			}
		} catch (error) {
			console.error('[StorageService] Failed to save item:', error);
		}
	}

	async loadItem(): Promise<string | null> {
		try {
			return await AsyncStorage.getItem(this.storageKey);
		} catch (error) {
			console.error('[StorageService] Failed to load item:', error);
			return null;
		}
	}

	async clearItem(): Promise<void> {
		try {
			await AsyncStorage.removeItem(this.storageKey);
		} catch (error) {
			console.error('[StorageService] Failed to clear item:', error);
		}
	}
}
