/* eslint-disable no-void */
import { HealthCheckResponse } from '@services/ApiClient';
import { healthCheckLog } from '@utils/logUtils';
import { useCallback, useEffect, useState } from 'react';

type BackendStatus = 'checking' | 'online' | 'offline';

type UseBackendHealthOptions = {
	pollIntervalMs?: number;
};

export function useBackendHealth(
	checkHealth: () => Promise<HealthCheckResponse>,
	options?: UseBackendHealthOptions,
) {
	const pollIntervalMs = options?.pollIntervalMs ?? 30_000;
	const [backendStatus, setBackendStatus] =
		useState<BackendStatus>('checking');

	const refreshHealth = useCallback(async () => {
		try {
			const response = await checkHealth();
			setBackendStatus(
				response.status === 'ok' ? 'online' : 'offline',
			);
		} catch {
			setBackendStatus('offline');
		}
	}, [checkHealth]);

	useEffect(() => {
		let isActive = true;

		const runHealthCheck = async () => {
			healthCheckLog.debug('Ran backend health check');
			try {
				const response = await checkHealth();
				if (!isActive) {
					return;
				}
				setBackendStatus(
					response.status === 'ok' ? 'online' : 'offline',
				);
			} catch {
				if (!isActive) {
					return;
				}
				setBackendStatus('offline');
			}
		};

		void runHealthCheck();
		const intervalId = setInterval(() => {
			void runHealthCheck();
		}, pollIntervalMs);

		return () => {
			isActive = false;
			clearInterval(intervalId);
		};
	}, [checkHealth, pollIntervalMs]);

	return {
		backendStatus,
		isBackendOnline: backendStatus === 'online',
		refreshHealth,
	};
}
