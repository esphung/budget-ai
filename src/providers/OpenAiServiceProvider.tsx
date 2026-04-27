import { ApiClient } from '@services/ApiClient';
import { OpenAiService } from '@services/OpenAiService';
import React, { createContext, ReactNode, useContext } from 'react';

// Define the shape of the context state
interface OpenAiServiceContext {
	openAiService: OpenAiService;
}

// Create the context
const OpenAiServiceContext = createContext<OpenAiService | undefined>(
	undefined,
);

// Provider component
export const OpenAiServiceProvider: React.FC<{
	children: ReactNode;
	apiClient: ApiClient;
}> = ({ children, apiClient }) => {
	const openAiService = new OpenAiService(apiClient);

	return (
		<OpenAiServiceContext.Provider value={openAiService}>
			{children}
		</OpenAiServiceContext.Provider>
	);
};

// Custom hook for consuming the context
export const useOpenAiService = (): OpenAiService => {
	const context = useContext(OpenAiServiceContext);
	if (!context) {
		throw new Error(
			'useOpenAiService must be used within a OpenAiServiceProvider',
		);
	}
	return context;
};
