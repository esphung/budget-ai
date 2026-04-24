import { TestID } from '@enums/TestID';
import { render } from '@testing-library/react-native';
import App from './App';

// safe-area provider is required for themed screen in login/app stack
jest.mock('react-native-safe-area-context', () => {
	return {
		useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
		SafeAreaProvider: ({ children }: { children: React.ReactNode }) => (
			<>{children}</>
		),
	};
});

describe('App', () => {
	it('renders the root stack', () => {
		const { getByTestId } = render(<App />);
		const rootStack = getByTestId(TestID.RootStack);
		expect(rootStack).toBeVisible();
	});
});
