import { notifyTableChanged } from '@db/databaseChangeNotifier';
import { useReactiveAccounts } from '@hooks/useReactiveAccounts';
import { Account } from 'types/Account';
import { act } from '@testing-library/react-native';
import { renderHook, waitFor } from '@testing-library/react-native';
import { DB } from '@op-engineering/op-sqlite';

const createMockAccount = (overrides?: Partial<Account>): Account => ({
	id: 'acct_1',
	name: 'Cash',
	accountType: 'cash',
	currency: 'USD',
	createdAt: '2026-04-28T12:00:00.000Z',
	updatedAt: '2026-04-28T12:00:00.000Z',
	...overrides,
});

describe('useReactiveAccounts', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('returns empty list when db is null', () => {
		const { result } = renderHook(() => useReactiveAccounts(null));

		expect(result.current).toEqual([]);
	});

	it('loads accounts from database', async () => {
		const rows: Account[] = [createMockAccount()];
		const mockDb = {
			execute: jest.fn().mockResolvedValue({ rows }),
			reactiveExecute: jest.fn().mockReturnValue(jest.fn()),
		} as unknown as DB;

		const { result } = renderHook(() => useReactiveAccounts(mockDb));

		await waitFor(() => {
			expect(result.current).toEqual(rows);
		});
	});

	it('sets up reactive listener for accounts table', async () => {
		const mockDb = {
			execute: jest.fn().mockResolvedValue({ rows: [] }),
			reactiveExecute: jest.fn().mockReturnValue(jest.fn()),
		} as unknown as DB;

		renderHook(() => useReactiveAccounts(mockDb));

		await waitFor(() => {
			expect(mockDb.reactiveExecute).toHaveBeenCalledWith(
				expect.objectContaining({
					fireOn: [{ table: 'accounts' }],
				}),
			);
		});
	});

	it('refetches when accounts are explicitly notified', async () => {
		const rows: Account[] = [createMockAccount()];
		const mockDb = {
			execute: jest.fn().mockResolvedValue({ rows }),
			reactiveExecute: jest.fn().mockReturnValue(jest.fn()),
		} as unknown as DB;

		renderHook(() => useReactiveAccounts(mockDb));

		await waitFor(() => {
			expect(mockDb.execute).toHaveBeenCalledTimes(1);
		});

		act(() => {
			notifyTableChanged('accounts');
		});

		await waitFor(() => {
			expect(mockDb.execute).toHaveBeenCalledTimes(2);
		});
	});
});
