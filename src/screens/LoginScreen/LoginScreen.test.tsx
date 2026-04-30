import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import LoginScreen from './LoginScreen';
import { TestID } from '@enums/TestID';
import { useAuthStore } from '@providers/AuthProvider';

jest.mock('@providers/AuthProvider', () => ({
	useAuthStore: jest.fn(),
}));

describe('LoginScreen', () => {
	const mockLogin = jest.fn().mockResolvedValue(undefined);

	beforeEach(() => {
		mockLogin.mockClear();
		(useAuthStore as jest.Mock).mockImplementation((selector) => {
			const store = { login: mockLogin };
			return selector ? selector(store) : store;
		});
	});

	it('renders the LoginScreen with welcome text', () => {
		const { getByTestId, getByText } = render(<LoginScreen />);

		// Check if the LoginScreen container is rendered
		const loginScreen = getByTestId(TestID.LoginScreen);
		expect(loginScreen).toBeTruthy();

		// Check if the welcome text is displayed
		const welcomeText = getByText('Welcome to BudgetAI!');
		expect(welcomeText).toBeTruthy();
	});

	it('calls login when the Login button is pressed', async () => {
		const { getByText } = render(<LoginScreen />);

		// Press the Login button
		const loginButton = getByText('Login');
		fireEvent.press(loginButton);

		await waitFor(() => {
			expect(mockLogin).toHaveBeenCalledTimes(1);
		});
	});
});
