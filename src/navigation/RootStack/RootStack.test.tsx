import { TestID } from '@enums/TestID';
import { createAuthStore } from '@stores/AuthStore';
import { render } from '@testing-library/react-native';
import RootStack from '@navigation/RootStack/RootStack';
import { AuthProvider } from '@providers/AuthProvider';

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
