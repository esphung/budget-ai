import { TestID } from '@enums/TestID';
import AuthStack from '@navigation/AuthStack/AuthStack';
import { AuthProvider } from '@providers/AuthProvider';
import { StorageService } from '@services/StorageService';
import { createAuthStore } from '@stores/AuthStore';
import { render } from '@testing-library/react-native';

describe('AuthStack - Login Flow', () => {
	it('renders LoginScreen with login button', () => {
		const storage = StorageService.getInstance('@test_storage_key');
		const store = createAuthStore(storage);
		const { getByTestId, getByText } = render(
			<AuthProvider store={store} storage={storage}>
				<AuthStack />
			</AuthProvider>,
		);

		const loginScreen = getByTestId(TestID.LoginScreen);
		const loginButton = getByText('Login');

		expect(loginScreen).toBeVisible();
		expect(loginButton).toBeVisible();
	});
});
