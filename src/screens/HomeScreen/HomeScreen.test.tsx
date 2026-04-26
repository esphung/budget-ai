import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';
import { TestID } from '@enums/TestID';
import { useAuthStore } from '@providers/AuthProvider';

jest.mock('@providers/AuthProvider', () => ({
	useAuthStore: jest.fn(),
}));

describe('HomeScreen', () => {
	it('renders the HomeScreen with welcome text', () => {
		(useAuthStore as jest.Mock).mockReturnValue({ logout: jest.fn() });

		const { getByTestId, getByText } = render(<HomeScreen />);

		// Check if the HomeScreen container is rendered
		const homeScreen = getByTestId(TestID.HomeScreen);
		expect(homeScreen).toBeTruthy();

		// Check if the welcome text is displayed
		const welcomeText = getByText('Welcome to the Home Screen!');
		expect(welcomeText).toBeTruthy();
	});

	it('calls logout when the Logout button is pressed', () => {
		const mockLogout = jest.fn();
		(useAuthStore as jest.Mock).mockReturnValue({ logout: mockLogout });

		const { getByText } = render(<HomeScreen />);

		// Press the Logout button
		const logoutButton = getByText('Logout');
		fireEvent.press(logoutButton);

		// Verify that logout was called
		expect(mockLogout).toHaveBeenCalled();
	});
});
