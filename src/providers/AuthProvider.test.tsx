import { createAuthStore } from '@stores/AuthStore';
import {
	renderHook,
	act as testAct,
	waitFor,
} from '@testing-library/react-native';
import * as React from 'react';
import { AuthProvider, useAuthStore } from './AuthProvider';
import { StorageService } from '@services/StorageService';

const mockAuthService = {
	login: jest.fn().mockResolvedValue('mock-auth0-token'),
	logout: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@services/StorageService', () => {
	return {
		StorageService: {
			getInstance: jest.fn(() => ({
				saveItem: jest.fn().mockResolvedValue(undefined),
				loadItem: jest.fn().mockResolvedValue('saved-token'),
				clearItem: jest.fn().mockResolvedValue(undefined),
			})),
		},
	};
});

jest.mock('@react-native-async-storage/async-storage', () => {
	return {
		getItem: jest.fn().mockResolvedValue(null),
		setItem: jest.fn(() => Promise.resolve()),
		removeItem: jest.fn(() => Promise.resolve()),
	};
});

describe('AuthProvider', () => {
	it('renders children when token is set', () => {
		const store = createAuthStore(mockAuthService);
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store}>{children}</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		testAct(() => {
			result.current.setToken('test-token');
		});

		expect(result.current.token).toBe('test-token');
	});

	it('loads persisted token on mount', async () => {
		const store = createAuthStore(mockAuthService);
		const mockStorage = StorageService.getInstance('@auth');
		const actions = store.createActions(jest.fn(), mockStorage);

		// Set the token if provided
		const token = 'saved-token';
		testAct(() => {
			actions.setToken(token);
		});

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store}>{children}</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		await waitFor(() => {
			expect(result.current.token).toBe('saved-token');
		});
	});

	it('setToken action updates token in context', () => {
		const store = createAuthStore(mockAuthService);

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store}>{children}</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		expect(result.current.token).toBeNull();

		// Call setToken to update state
		testAct(() => {
			result.current.setToken('new-token');
		});

		// Token should be updated in context
		expect(result.current.token).toBe('new-token');
	});

	it('logout action resets token to null', async () => {
		const store = createAuthStore(mockAuthService);

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store}>{children}</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		// Set token first
		testAct(() => {
			result.current.setToken('token-to-logout');
		});
		expect(result.current.token).toBe('token-to-logout');

		// Then logout
		await testAct(async () => {
			await result.current.logout();
		});
		expect(result.current.token).toBeNull();
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
