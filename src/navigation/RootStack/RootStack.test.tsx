import { TestID } from '@enums/TestID';
import { createAuthStore } from '@stores/AuthStore';
import { render, waitFor } from '@testing-library/react-native';
import RootStack from '@navigation/RootStack/RootStack';
import { AuthProvider } from '@providers/AuthProvider';
import { StorageService } from '@services/StorageService';

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

function createStorageMock(loadValue: string | null): StorageService {
	return {
		saveItem: jest.fn().mockResolvedValue(undefined),
		loadItem: jest.fn().mockResolvedValue(loadValue),
		clearItem: jest.fn().mockResolvedValue(undefined),
	} as unknown as StorageService;
}

describe('RootStack', () => {
	it('renders AuthStack when token is null', () => {
		const storage = createStorageMock(null);
		const store = createAuthStore(storage);
		const { getByTestId } = render(
			<AuthProvider store={store} storage={storage}>
				<RootStack apiClient={{} as any} />
			</AuthProvider>,
		);
		const authStack = getByTestId(TestID.AuthStack);
		expect(authStack).toBeVisible();
	});

	it('renders AppStack when persisted token exists', async () => {
		const storage = createStorageMock('persisted-token');
		const store = createAuthStore(storage);
		const { getByTestId } = render(
			<AuthProvider store={store} storage={storage}>
				<RootStack apiClient={{} as any} />
			</AuthProvider>,
		);

		await waitFor(() => {
			expect(getByTestId(TestID.AppStack)).toBeVisible();
		});
	});
});
