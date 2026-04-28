import { TestID } from '@enums/TestID';
import useLoadThread from '@hooks/useLoadThread';
import { useReactiveAIMessages } from '@hooks/useReactiveAIMessages';
import { useReactiveTransactions } from '@hooks/useReactiveTransactions';
import { useTransactionBalance } from '@hooks/useTransactionBalance';
import { ApiClientProvider } from '@providers/ApiClientProvider';
import { useAuthStore } from '@providers/AuthProvider';
import { DatabaseProvider } from '@providers/DatabaseProvider';
import { OpenAiServiceProvider } from '@providers/OpenAiServiceProvider';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from './HomeScreen';

jest.mock('@providers/AuthProvider', () => ({
	useAuthStore: jest.fn(),
}));

jest.mock('@services/DatabaseService', () => ({
	DatabaseService: {
		getInstance: jest.fn().mockReturnValue({
			init: jest.fn(),
			addListener: jest.fn(),
			removeListener: jest.fn(),
		}),
	},
}));

jest.mock('@hooks/useLoadThread', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('@hooks/useReactiveAIMessages');
jest.mock('@hooks/useReactiveTransactions');
jest.mock('@hooks/useTransactionBalance');

const mockNavigation = {
	navigate: jest.fn(),
	goBack: jest.fn(),
};

const mockProps = {
	navigation: mockNavigation,
	route: { params: {} },
} as unknown as React.ComponentProps<typeof HomeScreen>;

function renderWithProviders(ui: React.ReactElement) {
	return render(
		<DatabaseProvider db={null}>
			<ApiClientProvider>
				<OpenAiServiceProvider>{ui}</OpenAiServiceProvider>
			</ApiClientProvider>
		</DatabaseProvider>,
	);
}

describe('HomeScreen', () => {
	beforeEach(() => {
		(useAuthStore as jest.Mock).mockReturnValue({ logout: jest.fn() });
		(useReactiveTransactions as jest.Mock).mockReturnValue([]);
		(useTransactionBalance as jest.Mock).mockReturnValue(0);
	});

	it('renders the HomeScreen', () => {
		(useLoadThread as jest.Mock).mockReturnValue({
			threadId: null,
			isLoading: true,
		});
		(useReactiveAIMessages as jest.Mock).mockReturnValue([]);

		const { getByTestId } = renderWithProviders(
			<HomeScreen {...mockProps} />,
		);

		expect(getByTestId(TestID.HomeScreen)).toBeVisible();
	});

	it('shows the loading view when the thread is loading', () => {
		(useLoadThread as jest.Mock).mockReturnValue({
			threadId: null,
			isLoading: true,
		});
		(useReactiveAIMessages as jest.Mock).mockReturnValue([]);

		const { getByText } = renderWithProviders(
			<HomeScreen {...mockProps} />,
		);

		expect(getByText('Loading conversation thread...')).toBeVisible();
	});

	it('shows the empty state when the thread is loaded but has no messages', () => {
		(useLoadThread as jest.Mock).mockReturnValue({
			threadId: 'thread-1',
			isLoading: false,
		});
		(useReactiveAIMessages as jest.Mock).mockReturnValue([]);

		const { getByText } = renderWithProviders(
			<HomeScreen {...mockProps} />,
		);

		expect(getByText('No messages yet.')).toBeVisible();
	});

	it('switches to transactions view when transactions pill is pressed', async () => {
		(useLoadThread as jest.Mock).mockReturnValue({
			threadId: 'thread-1',
			isLoading: false,
		});
		(useReactiveAIMessages as jest.Mock).mockReturnValue([]);
		(useReactiveTransactions as jest.Mock).mockReturnValue([
			{
				id: 'txn_1',
				amount: -4.5,
				merchant: 'Coffee Shop',
				category: 'Food and Drink',
				transactionType: 'expense',
				date: '2026-04-25',
				createdAt: '2026-04-25T12:00:00.000Z',
			},
		]);

		const { getByTestId, findByText } = renderWithProviders(
			<HomeScreen {...mockProps} />,
		);

		fireEvent.press(
			getByTestId(`${TestID.HomeScreen}-ViewTransactionsPill`),
		);

		expect(await findByText('Coffee Shop')).toBeVisible();
	});
});
