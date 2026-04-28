import { useBackendHealth } from '@hooks/useBackendHealth';
import { act, renderHook, waitFor } from '@testing-library/react-native';

describe('useBackendHealth', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	it('marks the backend online after a successful health check', async () => {
		const checkHealth = jest.fn().mockResolvedValue({ status: 'ok' });

		const { result } = renderHook(() =>
			useBackendHealth(checkHealth, { pollIntervalMs: 1_000 }),
		);

		await waitFor(() => {
			expect(result.current.backendStatus).toBe('online');
		});

		expect(checkHealth).toHaveBeenCalledTimes(1);
		expect(result.current.isBackendOnline).toBe(true);
	});

	it('marks the backend offline when the health check fails', async () => {
		const checkHealth = jest
			.fn()
			.mockRejectedValue(new Error('Network Error'));

		const { result } = renderHook(() =>
			useBackendHealth(checkHealth, { pollIntervalMs: 1_000 }),
		);

		await waitFor(() => {
			expect(result.current.backendStatus).toBe('offline');
		});

		expect(result.current.isBackendOnline).toBe(false);
	});

	it('polls the backend health on the configured interval', async () => {
		const checkHealth = jest.fn().mockResolvedValue({ status: 'ok' });

		renderHook(() =>
			useBackendHealth(checkHealth, { pollIntervalMs: 1_000 }),
		);

		await waitFor(() => {
			expect(checkHealth).toHaveBeenCalledTimes(1);
		});

		await act(async () => {
			jest.advanceTimersByTime(1_000);
		});

		await waitFor(() => {
			expect(checkHealth).toHaveBeenCalledTimes(2);
		});
	});

	it('allows manually refreshing backend health', async () => {
		const checkHealth = jest
			.fn()
			.mockRejectedValueOnce(new Error('Offline'))
			.mockResolvedValueOnce({ status: 'ok' });

		const { result } = renderHook(() =>
			useBackendHealth(checkHealth, { pollIntervalMs: 10_000 }),
		);

		await waitFor(() => {
			expect(result.current.backendStatus).toBe('offline');
		});

		await act(async () => {
			await result.current.refreshHealth();
		});

		expect(result.current.backendStatus).toBe('online');
	});
});
