import { TestID } from '@enums/TestID';
import AuthStack from '@navigation/AuthStack/AuthStack';
import { AuthProvider } from '@providers/AuthProvider';
import { createAuthStore } from '@stores/AuthStore';
import { render } from '@testing-library/react-native';

describe('AuthStack - Login Flow', () => {
	it('renders LoginScreen with login button', () => {
		const store = createAuthStore();
		const { getByTestId, getByText } = render(
			<AuthProvider store={store}>
				<AuthStack />
			</AuthProvider>,
		);

		const loginScreen = getByTestId(TestID.LoginScreen);
		const loginButton = getByText('Login');

		expect(loginScreen).toBeVisible();
		expect(loginButton).toBeVisible();
	});
});
