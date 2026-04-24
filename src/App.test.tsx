import { TestID } from '@enums/TestID';
import { render } from '@testing-library/react-native';
import App from './App';

describe('App', () => {
	it('renders the root stack', () => {
		const { getByTestId } = render(<App />);
		const rootStack = getByTestId(TestID.RootStack);
		expect(rootStack).toBeVisible();
	});
});
