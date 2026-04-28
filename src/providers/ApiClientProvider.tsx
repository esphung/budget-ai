import { ApiClient } from '@services/ApiClient';
import React, { createContext } from 'react';

const apiClient = new ApiClient('https://budget-ai-backend.onrender.com');

const ApiClientContext = createContext<{ api: ApiClient } | null>(null);

export const ApiClientProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<ApiClientContext.Provider value={{ api: apiClient }}>
			{children}
		</ApiClientContext.Provider>
	);
};

export const useApiClient = <T = undefined,>(
	selector?: (_: ApiClient) => T,
): T extends undefined ? { api: ApiClient } : T => {
	if (!apiClient) {
		throw new Error(
			'useApiClient must be used within an ApiClientProvider',
		);
	}
	if (selector) {
		return selector(apiClient) as T extends undefined
			? { api: ApiClient }
			: T;
	}
	return { api: apiClient } as T extends undefined
		? { api: ApiClient }
		: T;
};
