import { StorageKey } from '@enums/StorageKey';
import {
	ThemeProvider,
	useTheme,
	type ThemeMode,
} from '@providers/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	renderHook,
	act as testAct,
	waitFor,
} from '@testing-library/react-native';
import * as React from 'react';

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
}));

describe('ThemeProvider', () => {
	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<ThemeProvider>{children}</ThemeProvider>
	);

	beforeEach(() => {
		(AsyncStorage.getItem as jest.Mock).mockReset();
		(AsyncStorage.setItem as jest.Mock).mockReset();
		(AsyncStorage.removeItem as jest.Mock).mockReset();
	});

	it('hydrates persisted theme mode on mount', async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

		const { result } = renderHook(() => useTheme(), { wrapper });

		await waitFor(() => {
			expect(result.current.themeMode).toBe('dark');
		});
		expect(AsyncStorage.getItem).toHaveBeenCalledWith(
			`@preferences-${StorageKey.ThemeMode}`,
		);
	});

	it('persists theme mode when setThemeMode is called', () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
		(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

		const { result } = renderHook(() => useTheme(), { wrapper });

		testAct(() => {
			result.current.setThemeMode('dark');
		});

		expect(result.current.themeMode).toBe('dark');
		expect(AsyncStorage.setItem).toHaveBeenCalledWith(
			`@preferences-${StorageKey.ThemeMode}`,
			'dark',
		);
	});

	it('persists toggled theme mode', () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
		(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

		const { result } = renderHook(() => useTheme(), { wrapper });

		testAct(() => {
			result.current.toggleThemeMode();
		});

		const expectedMode: ThemeMode = 'dark';
		expect(result.current.themeMode).toBe(expectedMode);
		expect(AsyncStorage.setItem).toHaveBeenCalledWith(
			`@preferences-${StorageKey.ThemeMode}`,
			expectedMode,
		);
	});
});
