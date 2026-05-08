import { createAuthStore } from '@stores/AuthStore';
import {
	renderHook,
	act as testAct,
	waitFor,
} from '@testing-library/react-native';
import * as React from 'react';
import { AuthProvider, useAuthStore } from './AuthProvider';
import { StorageKey } from '@enums/StorageKey';

const mockAuthService = {
	login: jest.fn().mockResolvedValue({
		token: 'mock-auth0-token',
		userId: 'auth0|123',
	}),
	logout: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@services/StorageService', () => {
	const mockStorage = {
		saveItem: jest.fn().mockResolvedValue(undefined),
		loadItem: jest.fn().mockResolvedValue(null),
		clearItem: jest.fn().mockResolvedValue(undefined),
	};

	return {
		StorageService: {
			getInstance: jest.fn(() => mockStorage),
		},
		__mockStorage: mockStorage,
	};
});

jest.mock('@react-native-async-storage/async-storage', () => {
	return {
		getItem: jest.fn().mockResolvedValue(null),
		setItem: jest.fn(() => Promise.resolve()),
		removeItem: jest.fn(() => Promise.resolve()),
	};
});

type MockStorage = {
	saveItem: jest.Mock;
	loadItem: jest.Mock;
	clearItem: jest.Mock;
};

const mockStorage = (
	jest.requireMock('@services/StorageService') as {
		__mockStorage: MockStorage;
	}
).__mockStorage;

describe('AuthProvider', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockStorage.loadItem.mockResolvedValue(null);
	});

	it('renders children when token is set', async () => {
		const store = createAuthStore(mockAuthService);
		(mockStorage.loadItem as jest.Mock).mockResolvedValue(null);
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store}>{children}</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		await waitFor(() => {
			expect(result.current.token).toBeNull();
		});

		testAct(() => {
			result.current.setToken('test-token');
		});

		expect(result.current.token).toBe('test-token');
	});

	it('loads persisted token on mount', async () => {
		const store = createAuthStore(mockAuthService);
		(mockStorage.loadItem as jest.Mock).mockImplementation(
			async (key: StorageKey) => {
				if (key === StorageKey.AuthToken) {
					return 'saved-token';
				}
				if (key === StorageKey.AuthUserId) {
					return 'auth0|saved-user';
				}
				return null;
			},
		);

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store}>{children}</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		await waitFor(() => {
			expect(result.current.token).toBe('saved-token');
			expect(result.current.userId).toBe('auth0|saved-user');
		});
	});

	it('setToken action updates token in context', async () => {
		const store = createAuthStore(mockAuthService);
		(mockStorage.loadItem as jest.Mock).mockResolvedValue(null);

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store}>{children}</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		await waitFor(() => {
			expect(result.current.token).toBeNull();
		});

		// Call setToken to update state
		testAct(() => {
			result.current.setToken('new-token');
		});

		// Token should be updated in context
		expect(result.current.token).toBe('new-token');
	});

	it('logout action resets token to null', async () => {
		const store = createAuthStore(mockAuthService);
		(mockStorage.loadItem as jest.Mock).mockResolvedValue(null);

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store}>{children}</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		await waitFor(() => {
			expect(result.current.token).toBeNull();
			expect(result.current.userId).toBeNull();
		});

		testAct(() => {
			result.current.setToken('token-to-logout', 'auth0|saved-user');
		});

		await waitFor(() => {
			expect(result.current.token).toBe('token-to-logout');
			expect(result.current.userId).toBe('auth0|saved-user');
		});

		// Then logout
		await testAct(async () => {
			await result.current.logout();
		});

		await waitFor(() => {
			expect(result.current.token).toBeNull();
			expect(result.current.userId).toBeNull();
		});
	});

	it('throws when called outside AuthProvider', () => {
		const consoleErrorSpy = jest
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		expect(() => renderHook(() => useAuthStore())).toThrow(
			'Missing AuthProvider',
		);

		consoleErrorSpy.mockRestore();
	});
});
