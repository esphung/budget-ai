import { TestID } from '@enums/TestID';
import { createAuthStore } from '@stores/AuthStore';
import { render } from '@testing-library/react-native';
import RootStack from '@navigation/RootStack/RootStack';
import { AuthProvider } from '@providers/AuthProvider';

// safe-area provider is required for themed screen in login/app stack
jest.mock('react-native-safe-area-context', () => {
	return {
		useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
		SafeAreaProvider: ({ children }: { children: React.ReactNode }) => (
			<>{children}</>
		),
	};
});

describe('RootStack', () => {
	it('renders AuthStack when token is null', () => {
		const store = createAuthStore();
		const { getByTestId } = render(
			<AuthProvider store={store}>
				<RootStack />
			</AuthProvider>,
		);
		const authStack = getByTestId(TestID.AuthStack);
		expect(authStack).toBeVisible();
	});

	it('renders AppStack when token is not null', () => {
		const store = createAuthStore({ token: 'authenticated' });
		const { getByTestId } = render(
			<AuthProvider store={store}>
				<RootStack />
			</AuthProvider>,
		);
		const appStack = getByTestId(TestID.AppStack);
		expect(appStack).toBeVisible();
	});
});
