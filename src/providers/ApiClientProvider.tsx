import { ApiClient } from '@services/ApiClient';
import React, { createContext } from 'react';

const apiClient = new ApiClient('http://localhost:3001');

const ApiClientContext = createContext<ApiClient | null>(null);

export const ApiClientProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	return (
		<ApiClientContext.Provider value={apiClient}>
			{children}
		</ApiClientContext.Provider>
	);
};

export const useApiClient = <T = undefined,>(
	selector?: (apiClient: ApiClient) => T,
): T extends undefined ? ApiClient : T => {
	if (!apiClient) {
		throw new Error(
			'useApiClient must be used within an ApiClientProvider',
		);
	}
	if (selector) {
		return selector(apiClient) as T extends undefined ? ApiClient : T;
	}
	return apiClient as T extends undefined ? ApiClient : T;
};
