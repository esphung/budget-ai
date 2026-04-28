import {
	OpenAiServiceProvider,
	useOpenAiService,
} from '@providers/OpenAiServiceProvider';
import { ApiClientProvider } from '@providers/ApiClientProvider';
import { AuthProvider } from '@providers/AuthProvider';
import { createAuthStore } from '@stores/AuthStore';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { DatabaseProvider } from './DatabaseProvider';

jest.mock('@services/OpenAiService', () => {
	return {
		OpenAiService: jest.fn().mockImplementation(() => ({})),
	};
});

// @op-engineering/op-sqlite
jest.mock('@op-engineering/op-sqlite', () => ({
	__esModule: true,
	open: jest.fn().mockReturnValue({
		close: jest.fn(),
		transaction: jest.fn().mockImplementation((cb) => {
			const tx = {
				execute: jest.fn(), // Add execute function
				executeSql: jest.fn(),
			};
			cb(tx);
		}),
	}),
}));

jest.mock('@react-native-async-storage/async-storage', () => {
	return {
		__esModule: true,
		default: {
			setItem: jest.fn(),
			getItem: jest.fn().mockResolvedValue(null),
			removeItem: jest.fn(),
		},
	};
});

describe('OpenAiServiceProvider', () => {
	it('provides the OpenAiService context to its children', () => {
		const authStore = createAuthStore();
		const mockDb = {
			getDbPath: jest.fn(() => '/tmp/budgetai.db'),
		} as unknown as any;

		const MockChild = () => {
			const openAiService = useOpenAiService();
			expect(openAiService).toBeDefined();
			return <Text>Mock Child</Text>;
		};

		render(
			<DatabaseProvider db={mockDb}>
				<ApiClientProvider>
					<AuthProvider store={authStore}>
						<OpenAiServiceProvider>
							<MockChild />
						</OpenAiServiceProvider>
					</AuthProvider>
				</ApiClientProvider>
			</DatabaseProvider>,
		);

		expect(screen.getByText('Mock Child')).toBeTruthy();
	});

	it('throws an error when useOpenAiService is used outside of the provider', () => {
		const consoleErrorSpy = jest
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		const TestComponent = () => {
			useOpenAiService();
			return null;
		};

		expect(() => render(<TestComponent />)).toThrow(
			'useOpenAiService must be used within a OpenAiServiceProvider',
		);

		consoleErrorSpy.mockRestore();
	});
});
