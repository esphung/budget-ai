import { OpenAiService } from '@services/OpenAiService';
import React, {
	createContext,
	ReactNode,
	useContext,
	useMemo,
} from 'react';
import { useApiClient } from '@providers/ApiClientProvider';

// Define the shape of the context state
interface OpenAiServiceContext {
	aiService: OpenAiService;
}

// Create the context
const OpenAiServiceContext = createContext<
	OpenAiServiceContext | undefined
>(undefined);

// Provider component
export const OpenAiServiceProvider: React.FC<{
	children: ReactNode;
}> = ({ children }) => {
	const api = useApiClient();
	const aiService = useMemo(() => new OpenAiService(api), [api]);

	return (
		<OpenAiServiceContext.Provider value={{ aiService }}>
			{children}
		</OpenAiServiceContext.Provider>
	);
};

// Custom hook for consuming the context
export const useOpenAiService = (): OpenAiServiceContext => {
	const context = useContext(OpenAiServiceContext);
	if (!context) {
		throw new Error(
			'useOpenAiService must be used within a OpenAiServiceProvider',
		);
	}
	return context;
};
