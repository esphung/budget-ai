import { TestID } from '@enums/TestID';
import useLoadThread from '@hooks/useLoadThread';
import { useReactiveAIMessages } from '@hooks/useReactiveAIMessages';
import { useReactiveTransactions } from '@hooks/useReactiveTransactions';
import { useTransactionBalance } from '@hooks/useTransactionBalance';
import { ApiClientProvider } from '@providers/ApiClientProvider';
import { useAuthStore } from '@providers/AuthProvider';
import { DatabaseProvider, useDatabase } from '@providers/DatabaseProvider';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import HomeScreen from './HomeScreen';

const mockDeleteExecute = jest.fn();

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

jest.mock('@providers/DatabaseProvider', () => ({
	DatabaseProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	useDatabase: jest.fn(() => ({ db: null })),
}));

jest.mock('@hooks/useLoadThread', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('@hooks/useReactiveAIMessages');
jest.mock('@hooks/useReactiveTransactions');
jest.mock('@hooks/useTransactionBalance');

jest.mock('@usecases/deleteTransaction', () => ({
	DeleteTransaction: jest.fn().mockImplementation(() => ({
		execute: mockDeleteExecute,
	})),
}));

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
		<DatabaseProvider dbService={{} as any}>
			<ApiClientProvider>{ui}</ApiClientProvider>
		</DatabaseProvider>,
	);
}

describe('HomeScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useAuthStore as jest.Mock).mockReturnValue({ logout: jest.fn() });
		(useDatabase as jest.Mock).mockReturnValue({ db: {} });
		(useReactiveTransactions as jest.Mock).mockReturnValue([]);
		(useTransactionBalance as jest.Mock).mockReturnValue(0);
	});

	it('renders the HomeScreen', () => {
		(useLoadThread as jest.Mock).mockReturnValue({
			threadId: null,
			isLoading: true,
		});
		(useReactiveAIMessages as jest.Mock).mockReturnValue({
			messages: [],
			isLoaded: false,
		});

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
		(useReactiveAIMessages as jest.Mock).mockReturnValue({
			messages: [],
			isLoaded: false,
		});

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
		(useReactiveAIMessages as jest.Mock).mockReturnValue({
			messages: [],
			isLoaded: true,
		});

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
		(useReactiveAIMessages as jest.Mock).mockReturnValue({
			messages: [],
			isLoaded: true,
		});
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

	it('confirms and deletes a transaction from the transactions table', async () => {
		const alertSpy = jest
			.spyOn(Alert, 'alert')
			.mockImplementation(() => undefined);

		(useLoadThread as jest.Mock).mockReturnValue({
			threadId: 'thread-1',
			isLoading: false,
		});
		(useReactiveAIMessages as jest.Mock).mockReturnValue({
			messages: [],
			isLoaded: true,
		});
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

		const { getByTestId, findByTestId } = renderWithProviders(
			<HomeScreen {...mockProps} />,
		);

		fireEvent.press(
			getByTestId(`${TestID.HomeScreen}-ViewTransactionsPill`),
		);
		fireEvent.press(await findByTestId('transaction-delete-txn_1'));

		expect(alertSpy).toHaveBeenCalledWith(
			'Delete transaction?',
			'This will permanently remove Coffee Shop from local storage.',
			expect.arrayContaining([
				expect.objectContaining({
					text: 'Cancel',
					style: 'cancel',
				}),
				expect.objectContaining({
					text: 'Delete',
					style: 'destructive',
					onPress: expect.any(Function),
				}),
			]),
		);

		const buttons = alertSpy.mock.calls[0]?.[2];
		const deleteButton = buttons?.find(
			(button) => button.text === 'Delete',
		);

		await deleteButton?.onPress?.();

		expect(mockDeleteExecute).toHaveBeenCalledWith('txn_1');
	});
});
