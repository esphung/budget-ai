import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';
import { TestID } from '@enums/TestID';
import { useAuthStore } from '@providers/AuthProvider';

jest.mock('@providers/AuthProvider', () => ({
	useAuthStore: jest.fn(),
}));

describe('LoginScreen', () => {
	it('renders the LoginScreen with welcome text', () => {
		(useAuthStore as jest.Mock).mockReturnValue(jest.fn());

		const { getByTestId, getByText } = render(<LoginScreen />);

		// Check if the LoginScreen container is rendered
		const loginScreen = getByTestId(TestID.LoginScreen);
		expect(loginScreen).toBeTruthy();

		// Check if the welcome text is displayed
		const welcomeText = getByText('Welcome to BudgetAI!');
		expect(welcomeText).toBeTruthy();
	});

	it('calls setToken when the Login button is pressed', () => {
		const mockSetToken = jest.fn();
		(useAuthStore as jest.Mock).mockReturnValue(mockSetToken);

		const { getByText } = render(<LoginScreen />);

		// Press the Login button
		const loginButton = getByText('Login');
		fireEvent.press(loginButton);

		// Verify that setToken was called with the correct argument
		expect(mockSetToken).toHaveBeenCalledWith('authenticated');
	});
});
