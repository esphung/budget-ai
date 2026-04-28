import {
	TransactionRecord,
	useReactiveTransactions,
} from '@hooks/useReactiveTransactions';
import { renderHook, waitFor } from '@testing-library/react-native';
import { DB } from '@op-engineering/op-sqlite';

describe('useReactiveTransactions', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('returns empty list when db is null', () => {
		const { result } = renderHook(() => useReactiveTransactions(null));

		expect(result.current).toEqual([]);
	});

	it('loads transactions from database', async () => {
		const rows: TransactionRecord[] = [
			{
				id: 'txn_1',
				amount: -12.5,
				merchant: 'Lunch',
				category: 'Food',
				transactionType: 'expense',
				date: '2026-04-28',
				createdAt: '2026-04-28T12:00:00.000Z',
			},
		];

		const mockDb = {
			execute: jest.fn().mockResolvedValue({ rows: rows }),
			reactiveExecute: jest.fn().mockReturnValue(jest.fn()),
		} as unknown as DB;

		const { result } = renderHook(() =>
			useReactiveTransactions(mockDb),
		);

		await waitFor(() => {
			expect(result.current).toEqual(rows);
		});
	});

	it('sets up reactive listener for transactions table', async () => {
		const mockDb = {
			execute: jest.fn().mockResolvedValue({ rows: [] }),
			reactiveExecute: jest.fn().mockReturnValue(jest.fn()),
		} as unknown as DB;

		renderHook(() => useReactiveTransactions(mockDb));

		await waitFor(() => {
			expect(mockDb.reactiveExecute).toHaveBeenCalledWith(
				expect.objectContaining({
					fireOn: [{ table: 'transactions' }],
				}),
			);
		});
	});
});
