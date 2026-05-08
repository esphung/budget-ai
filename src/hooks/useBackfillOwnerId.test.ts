import { useBackfillOwnerId } from '@hooks/useBackfillOwnerId';
import { executeTransaction } from '@db/executeTransaction';
import { notifyTableChanged } from '@db/databaseChangeNotifier';
import { renderHook, waitFor } from '@testing-library/react-native';
import { DB } from '@op-engineering/op-sqlite';

jest.mock('@db/executeTransaction', () => ({
	executeTransaction: jest.fn(),
}));

jest.mock('@db/databaseChangeNotifier', () => ({
	notifyTableChanged: jest.fn(),
}));

const mockExecuteTransaction = executeTransaction as jest.MockedFunction<
	typeof executeTransaction
>;
const mockNotifyTableChanged = notifyTableChanged as jest.MockedFunction<
	typeof notifyTableChanged
>;

describe('useBackfillOwnerId', () => {
	const db = {} as DB;

	beforeEach(() => {
		jest.clearAllMocks();
		mockExecuteTransaction.mockResolvedValue(undefined);
	});

	it('does not backfill when userId is null', async () => {
		renderHook(() => useBackfillOwnerId(db, null));

		await waitFor(() => {
			expect(mockExecuteTransaction).not.toHaveBeenCalled();
		});
	});

	it('backfills once for the current user and emits table notifications', async () => {
		const { rerender } = renderHook(
			({ userId }) => useBackfillOwnerId(db, userId),
			{
				initialProps: { userId: 'auth0|user_1' as string | null },
			},
		);

		await waitFor(() => {
			expect(mockExecuteTransaction).toHaveBeenCalledTimes(1);
		});

		expect(mockExecuteTransaction).toHaveBeenCalledWith(db, [
			{
				sql: 'UPDATE transactions SET owner_id = ? WHERE owner_id IS NULL',
				args: ['auth0|user_1'],
			},
			{
				sql: 'UPDATE accounts SET owner_id = ? WHERE owner_id IS NULL',
				args: ['auth0|user_1'],
			},
			{
				sql: 'UPDATE categories SET owner_id = ? WHERE owner_id IS NULL',
				args: ['auth0|user_1'],
			},
			{
				sql: 'UPDATE budgets SET owner_id = ? WHERE owner_id IS NULL',
				args: ['auth0|user_1'],
			},
		]);

		expect(mockNotifyTableChanged).toHaveBeenCalledTimes(4);

		rerender({ userId: 'auth0|user_1' });

		await waitFor(() => {
			expect(mockExecuteTransaction).toHaveBeenCalledTimes(1);
		});
	});

	it('backfills again when the authenticated user changes', async () => {
		const { rerender } = renderHook(
			({ userId }) => useBackfillOwnerId(db, userId),
			{
				initialProps: { userId: 'auth0|user_1' as string | null },
			},
		);

		await waitFor(() => {
			expect(mockExecuteTransaction).toHaveBeenCalledTimes(1);
		});

		rerender({ userId: 'auth0|user_2' });

		await waitFor(() => {
			expect(mockExecuteTransaction).toHaveBeenCalledTimes(2);
		});

		expect(mockExecuteTransaction.mock.calls[1]?.[1]).toEqual([
			{
				sql: 'UPDATE transactions SET owner_id = ? WHERE owner_id IS NULL',
				args: ['auth0|user_2'],
			},
			{
				sql: 'UPDATE accounts SET owner_id = ? WHERE owner_id IS NULL',
				args: ['auth0|user_2'],
			},
			{
				sql: 'UPDATE categories SET owner_id = ? WHERE owner_id IS NULL',
				args: ['auth0|user_2'],
			},
			{
				sql: 'UPDATE budgets SET owner_id = ? WHERE owner_id IS NULL',
				args: ['auth0|user_2'],
			},
		]);
	});
});
