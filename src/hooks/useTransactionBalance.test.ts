import { useTransactionBalance } from '@hooks/useTransactionBalance';
import { renderHook, waitFor } from '@testing-library/react-native';
import { DB } from '@op-engineering/op-sqlite';

describe('useTransactionBalance', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('returns 0 when db is null', () => {
		const { result } = renderHook(() => useTransactionBalance(null));

		expect(result.current).toBe(0);
	});

	it('calculates total balance from transactions table', async () => {
		const mockDb = {
			execute: jest.fn().mockResolvedValue({
				rows: [{ total: 1500.75 }],
			}),
			reactiveExecute: jest.fn().mockReturnValue(jest.fn()),
		} as unknown as DB;

		const { result } = renderHook(() => useTransactionBalance(mockDb));

		await waitFor(() => {
			expect(result.current).toBe(1500.75);
		});
	});

	it('handles negative balance (more expenses than income)', async () => {
		const mockDb = {
			execute: jest.fn().mockResolvedValue({
				rows: [{ total: -250.5 }],
			}),
			reactiveExecute: jest.fn().mockReturnValue(jest.fn()),
		} as unknown as DB;

		const { result } = renderHook(() => useTransactionBalance(mockDb));

		await waitFor(() => {
			expect(result.current).toBe(-250.5);
		});
	});

	it('handles zero balance', async () => {
		const mockDb = {
			execute: jest.fn().mockResolvedValue({
				rows: [{ total: 0 }],
			}),
			reactiveExecute: jest.fn().mockReturnValue(jest.fn()),
		} as unknown as DB;

		const { result } = renderHook(() => useTransactionBalance(mockDb));

		await waitFor(() => {
			expect(result.current).toBe(0);
		});
	});

	it('handles empty result from database', async () => {
		const mockDb = {
			execute: jest.fn().mockResolvedValue({
				rows: [],
			}),
			reactiveExecute: jest.fn().mockReturnValue(jest.fn()),
		} as unknown as DB;

		const { result } = renderHook(() => useTransactionBalance(mockDb));

		await waitFor(() => {
			expect(result.current).toBe(0);
		});
	});

	it('sets up reactive listener on transactions table', async () => {
		const mockDb = {
			execute: jest.fn().mockResolvedValue({
				rows: [{ total: 1000 }],
			}),
			reactiveExecute: jest.fn((config) => {
				// Simulate immediate callback to trigger state update
				config.callback?.();
				return jest.fn();
			}),
		} as unknown as DB;

		renderHook(() => useTransactionBalance(mockDb));

		await waitFor(() => {
			expect(mockDb.reactiveExecute).toHaveBeenCalledWith(
				expect.objectContaining({
					fireOn: [{ table: 'transactions' }],
					callback: expect.any(Function),
				}),
			);
		});
	});

	it('refetches balance when reactive listener fires', async () => {
		const mockDb = {
			execute: jest
				.fn()
				.mockResolvedValueOnce({
					rows: [{ total: 1000 }],
				})
				.mockResolvedValueOnce({
					rows: [{ total: 1500 }],
				}),
			reactiveExecute: jest.fn().mockReturnValue(jest.fn()),
		} as unknown as DB;

		const { result } = renderHook(() => useTransactionBalance(mockDb));

		await waitFor(() => {
			expect(result.current).toBe(1000);
		});

		// Simulate reactive callback firing
		const reactiveConfig = (mockDb.reactiveExecute as jest.Mock).mock
			.calls[0][0];
		reactiveConfig.callback();

		await waitFor(() => {
			// Should have called execute twice now (initial + reactive callback)
			expect(mockDb.execute).toHaveBeenCalledTimes(2);
			expect(result.current).toBe(1500);
		});
	});
});
