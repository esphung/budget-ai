import { TestID } from '@enums/TestID';
import { render } from '@testing-library/react-native';
import App from './App';

jest.mock('@react-native-async-storage/async-storage', () => ({
	__esModule: true,
	default: {
		setItem: jest.fn().mockResolvedValue(undefined),
		getItem: jest.fn().mockResolvedValue(null),
		removeItem: jest.fn().mockResolvedValue(undefined),
	},
}));

describe('App', () => {
	it('renders the root stack', () => {
		const { getByTestId } = render(<App />);
		const rootStack = getByTestId(TestID.RootStack);
		expect(rootStack).toBeVisible();
	});
});
