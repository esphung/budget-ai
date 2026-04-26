import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';
import { TestID } from '@enums/TestID';
import { useAuthStoreWithSelector } from '@providers/AuthProvider';

jest.mock('@providers/AuthProvider', () => ({
	useAuthStoreWithSelector: jest.fn(),
}));

describe('LoginScreen', () => {
	it('renders the LoginScreen with welcome text', () => {
		(useAuthStoreWithSelector as jest.Mock).mockReturnValue(jest.fn());

		const { getByTestId, getByText } = render(<LoginScreen />);

		// Check if the LoginScreen container is rendered
		const loginScreen = getByTestId(TestID.LoginScreen);
		expect(loginScreen).toBeTruthy();

		// Check if the welcome text is displayed
		const welcomeText = getByText('Welcome to the Login Screen!');
		expect(welcomeText).toBeTruthy();
	});

	it('calls setToken when the Login button is pressed', () => {
		const mockSetToken = jest.fn();
		(useAuthStoreWithSelector as jest.Mock).mockReturnValue(
			mockSetToken,
		);

		const { getByText } = render(<LoginScreen />);

		// Press the Login button
		const loginButton = getByText('Login');
		fireEvent.press(loginButton);

		// Verify that setToken was called with the correct argument
		expect(mockSetToken).toHaveBeenCalledWith('authenticated');
	});
});
