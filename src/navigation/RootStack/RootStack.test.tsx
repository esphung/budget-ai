import { TestID } from '@enums/TestID';
import RootStack from '@navigation/RootStack/RootStack';
import { ApiClientProvider } from '@providers/ApiClientProvider';
import { AuthProvider } from '@providers/AuthProvider';
import { DatabaseProvider } from '@providers/DatabaseProvider';
import { StorageService } from '@services/StorageService';
import { createAuthStore } from '@stores/AuthStore';
import { render, waitFor } from '@testing-library/react-native';

// @op-engineering/op-sqlite
jest.mock('@op-engineering/op-sqlite', () => ({
	__esModule: true,
	open: jest.fn().mockReturnValue({
		close: jest.fn(),
		transaction: jest.fn().mockImplementation((cb) => {
			const tx = {
				execute: jest.fn(), // Add execute function
				executeSql: jest.fn(),
			};
			cb(tx);
		}),
	}),
}));

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

function renderWithProviders(
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

	return render(
		<DatabaseProvider
			service={
				{
					init: jest.fn(),
					addListener: jest.fn(),
					removeListener: jest.fn(),
				} as any
			}>
			<ApiClientProvider apiClient={jest.fn() as any}>
				<AuthProvider store={store}>{ui}</AuthProvider>
			</ApiClientProvider>
			,
		</DatabaseProvider>,
	);
}

describe('RootStack', () => {
	it('renders AuthStack when token is null', () => {
		const { getByTestId } = renderWithProviders(<RootStack />);
		const authStack = getByTestId(TestID.AuthStack);
		expect(authStack).toBeVisible();
	});

	it('renders AppStack when persisted token exists', async () => {
		const { getByTestId } = renderWithProviders(
			<RootStack />,
			'mock-token',
		);

		await waitFor(() => {
			expect(getByTestId(TestID.AppStack)).toBeVisible();
		});
	});
});
