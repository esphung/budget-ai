import LinkedAccountsTable from '@components/LinkedAccountsTable/LinkedAccountsTable';
import { render } from '@testing-library/react-native';
import { LinkAccount } from 'react-native-plaid-link-sdk';

describe('LinkedAccountsTable', () => {
	const mockAccounts: LinkAccount[] = [
		{
			id: 'acc_1',
			name: 'Checking Account',
			mask: '1234',
			subtype: 'checking',
			type: 'depository',
		} as LinkAccount,
		{
			id: 'acc_2',
			name: 'Savings Account',
			mask: '5678',
			subtype: 'savings',
			type: 'depository',
		} as LinkAccount,
	];

	it('renders the component with title', () => {
		const { getByText } = render(
			<LinkedAccountsTable accounts={mockAccounts} />,
		);

		expect(getByText('Linked Accounts')).toBeTruthy();
	});

	it('renders column headers', () => {
		const { getByText } = render(
			<LinkedAccountsTable accounts={mockAccounts} />,
		);

		expect(getByText('Name')).toBeTruthy();
		expect(getByText('Type')).toBeTruthy();
		expect(getByText('Mask')).toBeTruthy();
	});

	it('renders all account rows with correct data', () => {
		const { getByText } = render(
			<LinkedAccountsTable accounts={mockAccounts} />,
		);

		// Check first account
		expect(getByText('Checking Account')).toBeTruthy();
		expect(getByText('checking')).toBeTruthy();
		expect(getByText('••1234')).toBeTruthy();

		// Check second account
		expect(getByText('Savings Account')).toBeTruthy();
		expect(getByText('savings')).toBeTruthy();
		expect(getByText('••5678')).toBeTruthy();
	});

	it('renders empty list when no accounts provided', () => {
		const { getByText, queryAllByTestId } = render(
			<LinkedAccountsTable accounts={[]} />,
		);

		expect(getByText('Linked Accounts')).toBeTruthy();
		expect(getByText('Name')).toBeTruthy();
		// No account rows should render
		expect(queryAllByTestId(/acc_/).length).toBe(0);
	});

	it('masks account numbers correctly', () => {
		const { getByText } = render(
			<LinkedAccountsTable accounts={mockAccounts} />,
		);

		// Should show only last 4 digits with bullets
		expect(getByText('••1234')).toBeTruthy();
		expect(getByText('••5678')).toBeTruthy();
	});
});
