import { TestID } from '@enums/TestID';
import RootStack from '@navigation/RootStack/RootStack';
import { AuthProvider } from '@providers/AuthProvider';
import { StorageService } from '@services/StorageService';
import { createAuthStore } from '@stores/AuthStore';
import { render, waitFor } from '@testing-library/react-native';

jest.mock('@navigation/AppStack/AppStack', () => {
	const ids = require('@enums/TestID');
	const RN = require('react-native');

	return function MockAppStack() {
		return <RN.View testID={ids.TestID.AppStack} />;
	};
});

jest.mock('@navigation/AuthStack/AuthStack', () => {
	const ids = require('@enums/TestID');
	const RN = require('react-native');

	return function MockAuthStack() {
		return <RN.View testID={ids.TestID.AuthStack} />;
	};
});

jest.mock('@services/StorageService', () => {
	return {
		StorageService: {
			getInstance: jest.fn(() => ({
				saveItem: jest.fn(),
				loadItem: jest.fn().mockResolvedValue('mock-token'),
				clearItem: jest.fn(),
			})),
		},
	};
});

function renderWithAuthProvider(
	ui: React.ReactElement,
	token: string | null = null,
) {
	const store = createAuthStore();
	const mockStorage = StorageService.getInstance('@auth');
	const actions = store.createActions(jest.fn(), mockStorage);

	// Set the token if provided
	if (token) {
		actions.setToken(token);
	}

	return render(<AuthProvider store={store}>{ui}</AuthProvider>);
}

describe('RootStack', () => {
	it('renders AuthStack when token is null', () => {
		const { getByTestId } = renderWithAuthProvider(<RootStack />);
		const authStack = getByTestId(TestID.AuthStack);
		expect(authStack).toBeVisible();
	});

	it('renders AppStack when persisted token exists', async () => {
		const { getByTestId } = renderWithAuthProvider(
			<RootStack />,
			'mock-token',
		);

		await waitFor(() => {
			expect(getByTestId(TestID.AppStack)).toBeVisible();
		});
	});
});
