import { createAuthStore } from '@stores/AuthStore';
import { renderHook, act as testAct } from '@testing-library/react-native';
import * as React from 'react';
import {
	AuthProvider,
	useAuthStore,
	useAuthStoreWithSelector,
} from './AuthProvider';

describe('AuthProvider', () => {
	it('provides auth store context and state', () => {
		const store = createAuthStore();

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store}>{children}</AuthProvider>
		);

		const { result } = renderHook(() => useAuthStore(), { wrapper });

		expect(result.current).toBeDefined();
		expect(result.current.token).toBeNull();
	});

	it('setToken action updates token in context', () => {
		const store = createAuthStore();

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

	it('logout action resets token to null', () => {
		const store = createAuthStore();

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

	it('returns selected state from useAuthStoreWithSelector', () => {
		const store = createAuthStore({ token: 'selected-token' });

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<AuthProvider store={store}>{children}</AuthProvider>
		);

		const { result } = renderHook(
			() => useAuthStoreWithSelector((state) => state.token),
			{ wrapper },
		);

		expect(result.current).toBe('selected-token');
	});
});
