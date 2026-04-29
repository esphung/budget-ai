import { TestID } from '@enums/TestID';
import RootStack from '@navigation/RootStack/RootStack';
import { AuthProvider } from '@providers/AuthProvider';
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
		execute: jest.fn(),
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
	const mockStorage = {
		saveItem: jest.fn(),
		loadItem: jest.fn(),
		clearItem: jest.fn(),
	};

	return {
		StorageService: {
			getInstance: jest.fn(() => mockStorage),
		},
		__mockStorage: mockStorage,
	};
});

jest.mock('@db/runAIMigrations', () => ({
	__esModule: true,
	runAIMigrations: jest.fn().mockResolvedValue(undefined),
}));

function renderWithProviders(ui: React.ReactElement) {
	const store = createAuthStore();

	return render(<AuthProvider store={store}>{ui}</AuthProvider>);
}

describe('RootStack', () => {
	const { __mockStorage } = jest.requireMock('@services/StorageService');

	beforeEach(() => {
		__mockStorage.loadItem.mockReset();
	});

	it('renders AuthStack when token is null', async () => {
		__mockStorage.loadItem.mockResolvedValue(null);

		const { getByTestId } = renderWithProviders(<RootStack />);

		await waitFor(() => {
			expect(getByTestId(TestID.AuthStack)).toBeVisible();
		});
	});

	it('renders AppStack when persisted token exists', async () => {
		__mockStorage.loadItem.mockResolvedValue('mock-token');

		const { getByTestId } = renderWithProviders(<RootStack />);

		await waitFor(() => {
			expect(getByTestId(TestID.AppStack)).toBeVisible();
		});
	});
});
