import { createAuthStore } from '@stores/AuthStore';
import { StorageService } from '@services/StorageService';
import {
	renderHook,
	act as testAct,
	waitFor,
} from '@testing-library/react-native';
import * as React from 'react';
import { AuthProvider, useAuthStore } from './AuthProvider';

describe('AuthProvider', () => {
	let storage: StorageService;

	beforeEach(() => {
		storage = StorageService.getInstance('@test_storage_key');
	});

	it('provides auth store context and state', () => {
		const store = createAuthStore(storage);

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store} storage={storage}>
				{children}
			</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		expect(result.current).toBeDefined();
		expect(result.current.token).toBeNull();
	});

	it('loads persisted token on mount', async () => {
		jest.spyOn(storage, 'loadItem').mockResolvedValueOnce(
			'saved-token',
		);
		const store = createAuthStore(storage);

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store} storage={storage}>
				{children}
			</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		await waitFor(() => {
			expect(result.current.token).toBe('saved-token');
		});
	});

	it('setToken action updates token in context', () => {
		const store = createAuthStore(storage);

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store} storage={storage}>
				{children}
			</AuthProvider>
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

	it('logout action resets token to null', () => {
		const store = createAuthStore(storage);

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store} storage={storage}>
				{children}
			</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		// Set token first
		testAct(() => {
			result.current.setToken('token-to-logout');
		});
		expect(result.current.token).toBe('token-to-logout');

		// Then logout
		testAct(() => {
			result.current.logout();
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
