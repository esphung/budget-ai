import TransactionsTable, {
	TransactionListItem,
} from '@components/TransactionsTable/TransactionsTable';
import { fireEvent, render } from '@testing-library/react-native';

const createMockTransaction = (
	overrides?: Partial<TransactionListItem>,
): TransactionListItem => ({
	id: 'txn_edge_3',
	name: 'Manual Expense',
	amount: 4.5,
	transactionType: 'expense',
	date: '2024-04-21',
	category: 'Other',
	merchant: '',
	accountId: null,
	source: 'ai',
	syncStatus: 'synced',
	createdAt: new Date().toISOString(),
	...overrides,
});

describe('TransactionsTable', () => {
	const mockTransactions: TransactionListItem[] = [
		createMockTransaction({
			id: 'txn_1',
			name: 'Starbucks',
			amount: -4.5,
			transactionType: 'expense',
			date: '2024-04-20',
			category: 'Food & Drink',
			merchant: 'Starbucks',
		}),
		createMockTransaction({
			id: 'txn_2',
			name: 'Payroll Deposit',
			amount: 2500.0,
			transactionType: 'income',
			date: '2024-04-15',
			category: 'Salary',
			merchant: 'Employer Inc.',
		}),
		createMockTransaction({
			id: 'txn_3',
			name: 'Gas Station',
			amount: -45.0,
			transactionType: 'expense',
			date: '2024-04-19',
			category: 'Transportation',
			merchant: 'Bar',
		}),
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
	});

	it('renders all transaction rows with correct data', () => {
		const { getByText, queryAllByText } = render(
			<TransactionsTable transactions={mockTransactions} />,
		);

		// Check first transaction
		expect(getByText('Starbucks')).toBeTruthy();

		// Check second transaction
		expect(getByText('Payroll Deposit')).toBeTruthy();

		// Check third transaction
		expect(getByText('Gas Station')).toBeTruthy();

		// Dates are shown in expanded details, not in the main row
		expect(queryAllByText('Mocked Date').length).toBe(0);
	});

	it('formats positive amounts with + sign', () => {
		const { getByText } = render(
			<TransactionsTable transactions={mockTransactions} />,
		);

		expect(getByText('+$2,500.00')).toBeTruthy();
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
		const edgeCaseTransactions: TransactionListItem[] = [
			createMockTransaction({
				id: 'txn_edge_1',
				name: 'Zero Amount',
				amount: 0,
				transactionType: 'income',
				date: '2024-04-20',
				merchant: '',
			}),
			createMockTransaction({
				id: 'txn_edge_2',
				name: 'Large Negative',
				amount: -9999.99,
				transactionType: 'expense',
				date: '2024-04-19',
				merchant: '',
			}),
		];

		const { getByText } = render(
			<TransactionsTable transactions={edgeCaseTransactions} />,
		);

		expect(getByText('+$0.00')).toBeVisible();
		expect(getByText('-$9,999.99')).toBeVisible();
	});

	it('treats non-income transactions as expense labels even when amount is positive', () => {
		const transactions: TransactionListItem[] = [
			createMockTransaction(),
		];

		const { getByText } = render(
			<TransactionsTable transactions={transactions} />,
		);

		expect(getByText('-$4.50')).toBeVisible();
	});

	it('renders delete controls when a delete handler is provided', () => {
		const { getByText, getByTestId } = render(
			<TransactionsTable
				transactions={mockTransactions}
				onDeleteTransaction={jest.fn()}
			/>,
		);

		expect(getByText('Action')).toBeTruthy();
		expect(getByTestId('transaction-delete-txn_1')).toBeTruthy();
	});

	it('invokes delete handler with the selected transaction', () => {
		const onDeleteTransaction = jest.fn();
		const { getByTestId } = render(
			<TransactionsTable
				transactions={mockTransactions}
				onDeleteTransaction={onDeleteTransaction}
			/>,
		);

		fireEvent.press(getByTestId('transaction-delete-txn_2'));

		expect(onDeleteTransaction).toHaveBeenCalledWith(
			mockTransactions[1],
		);
	});
});
