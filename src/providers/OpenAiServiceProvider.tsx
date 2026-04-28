import { DB } from '@op-engineering/op-sqlite';
import { useApiClient } from '@providers/ApiClientProvider';
import { useDatabase } from '@providers/DatabaseProvider';
import { ApiClient } from '@services/ApiClient';
import { OpenAiService } from '@services/OpenAiService';
import React, {
	createContext,
	ReactNode,
	useContext,
	useMemo,
} from 'react';
import { useAuthStore } from './AuthProvider';

// Define the shape of the context state
interface OpenAiServiceContext {
	aiService: OpenAiService | null;
}

// Create the context
const OpenAiServiceContext = createContext<
	OpenAiServiceContext | undefined
>(undefined);

// Custom hook for initializing OpenAiService
const useOpenAiServiceInstance = (
	api: ApiClient,
	db: DB | null,
	logout: () => void,
): OpenAiService | null => {
	return useMemo(
		() => (db ? new OpenAiService(api, db, logout) : null),
		[api, db, logout],
	);
};

// Provider component
export const OpenAiServiceProvider: React.FC<{
	children: ReactNode;
}> = ({ children }) => {
	const { api } = useApiClient();
	const { db } = useDatabase();
	const logout = useAuthStore((s) => s.logout);

	const aiService = useOpenAiServiceInstance(api, db, () => logout());

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
