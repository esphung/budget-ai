import React, { createContext, useContext } from 'react';
import { ApiClient } from '@services/ApiClient';

const ApiClientContext = createContext<ApiClient | null>(null);

export const ApiClientProvider = ({
	children,
	apiClient,
}: {
	children: React.ReactNode;
	apiClient: ApiClient;
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
	const apiClient = useContext(ApiClientContext);
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
