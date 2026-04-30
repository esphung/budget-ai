import { TestID } from '@enums/TestID';
import AuthStack from '@navigation/AuthStack/AuthStack';
import { AuthProvider } from '@providers/AuthProvider';
import { createAuthStore } from '@stores/AuthStore';
import { render } from '@testing-library/react-native';

const mockAuthService = {
	login: jest.fn().mockResolvedValue('mock-auth0-token'),
	logout: jest.fn().mockResolvedValue(undefined),
};

// @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => {
	return {
		AsyncStorage: {
			setItem: jest.fn(),
			getItem: jest.fn().mockResolvedValue('mock-token'),
			removeItem: jest.fn(),
		},
	};
});

// mock storage service to avoid actual async storage calls
jest.mock('@services/StorageService', () => {
	return {
		StorageService: {
			getInstance: jest.fn(() => ({
				saveItem: jest.fn().mockResolvedValue(undefined),
				loadItem: jest.fn().mockResolvedValue('mock-token'),
				clearItem: jest.fn().mockResolvedValue(undefined),
			})),
		},
	};
});

// render with auth provider to provide necessary context
function renderWithAuthProvider(ui: React.ReactElement) {
	const store = createAuthStore(mockAuthService);
	return render(<AuthProvider store={store}>{ui}</AuthProvider>);
}

describe('AuthStack - Login Flow', () => {
	it('renders LoginScreen with login button', () => {
		const { getByTestId, getByText } = renderWithAuthProvider(
			<AuthStack />,
		);

		const loginScreen = getByTestId(TestID.LoginScreen);
		const loginButton = getByText('Login');

		expect(loginScreen).toBeVisible();
		expect(loginButton).toBeVisible();
	});
});
