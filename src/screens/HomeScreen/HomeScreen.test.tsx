import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';
import { TestID } from '@enums/TestID';
import { useAuthStore } from '@providers/AuthProvider';

jest.mock('@providers/AuthProvider', () => ({
	useAuthStore: jest.fn(),
}));

describe('HomeScreen', () => {
	it('renders the HomeScreen', () => {
		(useAuthStore as jest.Mock).mockReturnValue({ logout: jest.fn() });

		const { getByTestId } = render(<HomeScreen />);

		// Check if the HomeScreen container is rendered
		const homeScreen = getByTestId(TestID.HomeScreen);
		expect(homeScreen).toBeTruthy();
	});

	it('calls logout when the Logout button is pressed', () => {
		const mockLogout = jest.fn();
		(useAuthStore as jest.Mock).mockReturnValue({ logout: mockLogout });

		const { getByTestId } = render(<HomeScreen />);

		// Press the Logout button
		const logoutButton = getByTestId(TestID.LogoutButton);
		fireEvent.press(logoutButton);

		// Verify that logout was called
		expect(mockLogout).toHaveBeenCalled();
	});
});
