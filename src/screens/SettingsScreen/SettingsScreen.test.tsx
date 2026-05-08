import { useAuthStore } from '@providers/AuthProvider';
import { useApiClient } from '@providers/ApiClientProvider';
import { DatabaseProvider } from '@providers/DatabaseProvider';
import { ThemeProvider } from '@providers/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import SettingsScreen from './SettingsScreen';

jest.mock('@providers/AuthProvider', () => ({
	useAuthStore: jest.fn(),
}));

jest.mock('@providers/ApiClientProvider', () => ({
	useApiClient: jest.fn(),
}));

jest.mock('@providers/DatabaseProvider', () => ({
	DatabaseProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	useDatabase: jest.fn(() => ({ db: null })),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
}));

describe('SettingsScreen', () => {
	const renderScreen = () =>
		render(
			<DatabaseProvider>
				<ThemeProvider>
					<SettingsScreen />
				</ThemeProvider>
			</DatabaseProvider>,
		);

	beforeEach(() => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
		(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
		(AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
		(AsyncStorage.getItem as jest.Mock).mockClear();
		(AsyncStorage.setItem as jest.Mock).mockClear();
		(AsyncStorage.removeItem as jest.Mock).mockClear();

		(useAuthStore as jest.Mock).mockReturnValue({
			logout: jest.fn(),
			userId: 'auth0|test-user',
		});

		(useApiClient as jest.Mock).mockReturnValue({
			api: {
				transactions: {
					clear: jest.fn(),
				},
			},
		});
	});

	it('renders the switches card with one dark mode switch', () => {
		const { getByText, getByTestId } = renderScreen();

		expect(getByText('Preferences')).toBeVisible();
		expect(getByText('Toggle Settings')).toBeVisible();
		expect(getByText('Dark mode')).toBeVisible();
		expect(getByTestId('SettingsSwitch-dark_mode')).toBeVisible();
	});

	it('allows toggling dark mode on and off', () => {
		const { getByTestId } = renderScreen();

		const switchControl = getByTestId('SettingsSwitch-dark_mode');
		expect(switchControl.props.value).toBe(false);

		fireEvent(switchControl, 'valueChange', true);
		expect(getByTestId('SettingsSwitch-dark_mode').props.value).toBe(
			true,
		);

		fireEvent(
			getByTestId('SettingsSwitch-dark_mode'),
			'valueChange',
			false,
		);
		expect(getByTestId('SettingsSwitch-dark_mode').props.value).toBe(
			false,
		);
	});
});
