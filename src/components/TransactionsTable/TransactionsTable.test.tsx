import TransactionsTable from '@components/TransactionsTable/TransactionsTable';
import { render } from '@testing-library/react-native';

interface Transaction {
	id: string;
	name: string;
	amount: number;
	date: string;
	category: string[];
}

describe('TransactionsTable', () => {
	const mockTransactions: Transaction[] = [
		{
			id: 'txn_1',
			name: 'Starbucks',
			amount: -4.5,
			date: '2024-04-20',
			category: ['Food and Drink', 'Coffee Shop'],
		},
		{
			id: 'txn_2',
			name: 'Payroll Deposit',
			amount: 2500,
			date: '2024-04-18',
			category: ['Income', 'Salary'],
		},
		{
			id: 'txn_3',
			name: 'Gas Station',
			amount: -45.0,
			date: '2024-04-19',
			category: ['Transportation', 'Gas'],
		},
	];

	it('renders the component with title', () => {
		const { getByText } = render(
			<TransactionsTable transactions={mockTransactions} />,
		);

		expect(getByText('Transactions')).toBeTruthy();
	});

	it('renders column headers', () => {
		const { getByText } = render(
			<TransactionsTable transactions={mockTransactions} />,
		);

		expect(getByText('Name')).toBeTruthy();
		expect(getByText('Amount')).toBeTruthy();
		expect(getByText('Date')).toBeTruthy();
	});

	it('renders all transaction rows with correct data', () => {
		const { getByText } = render(
			<TransactionsTable transactions={mockTransactions} />,
		);

		// Check first transaction
		expect(getByText('Starbucks')).toBeTruthy();
		expect(getByText('2024-04-20')).toBeTruthy();

		// Check second transaction
		expect(getByText('Payroll Deposit')).toBeTruthy();
		expect(getByText('2024-04-18')).toBeTruthy();

		// Check third transaction
		expect(getByText('Gas Station')).toBeTruthy();
		expect(getByText('2024-04-19')).toBeTruthy();
	});

	it('formats positive amounts with + sign', () => {
		const { getByText } = render(
			<TransactionsTable transactions={mockTransactions} />,
		);

		expect(getByText('+$2500.00')).toBeTruthy();
	});

	it('formats negative amounts with - sign', () => {
		const { getByText } = render(
			<TransactionsTable transactions={mockTransactions} />,
		);

		expect(getByText('-$4.50')).toBeTruthy();
		expect(getByText('-$45.00')).toBeTruthy();
	});

	it('renders empty list when no transactions provided', () => {
		const { getByText, queryAllByTestId } = render(
			<TransactionsTable transactions={[]} />,
		);

		expect(getByText('Transactions')).toBeTruthy();
		expect(getByText('Name')).toBeTruthy();
		// No transaction rows should render
		expect(queryAllByTestId(/txn_/).length).toBe(0);
	});

	it('handles edge case amounts correctly', () => {
		const edgeCaseTransactions: Transaction[] = [
			{
				id: 'txn_edge_1',
				name: 'Zero Amount',
				amount: 0,
				date: '2024-04-20',
				category: ['Other'],
			},
			{
				id: 'txn_edge_2',
				name: 'Large Negative',
				amount: -9999.99,
				date: '2024-04-19',
				category: ['Other'],
			},
		];

		const { getByText } = render(
			<TransactionsTable transactions={edgeCaseTransactions} />,
		);

		expect(getByText('+$0.00')).toBeTruthy();
		expect(getByText('-$9999.99')).toBeTruthy();
	});
});
