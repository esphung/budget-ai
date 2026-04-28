import BalanceHeader from '@components/BalanceHeader/BalanceHeader';
import { render } from '@testing-library/react-native';

describe('BalanceHeader', () => {
	it('renders with positive balance in green', () => {
		const { getByText } = render(<BalanceHeader balance={1250.5} />);

		expect(getByText('Total Balance')).toBeDefined();
		expect(getByText('$1,250.50')).toBeDefined();
	});

	it('renders with negative balance in red', () => {
		const { getByText } = render(<BalanceHeader balance={-350.25} />);

		expect(getByText('-$350.25')).toBeDefined();
	});

	it('renders zero balance', () => {
		const { getByText } = render(<BalanceHeader balance={0} />);

		expect(getByText('$0.00')).toBeDefined();
	});

	it('renders loading state', () => {
		const { getByText } = render(
			<BalanceHeader balance={1250.5} isLoading={true} />,
		);

		expect(getByText('—')).toBeDefined();
	});

	it('formats large numbers with commas', () => {
		const { getByText } = render(<BalanceHeader balance={10000} />);

		expect(getByText('$10,000.00')).toBeDefined();
	});
});
