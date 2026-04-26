import {
	ApiClientProvider,
	useApiClient,
} from '@providers/ApiClientProvider';
import { ApiClient } from '@services/ApiClient';
import { render } from '@testing-library/react-native';
import React from 'react';

const MockText = ({ children }: { children: React.ReactNode }) => {
	const RNText = require('react-native').Text;
	return <RNText>{children}</RNText>;
};

jest.mock('@services/ApiClient', () => {
	return {
		ApiClient: jest.fn().mockImplementation(() => {
			return {
				plaid: {
					getLinkToken: jest.fn(() => 'mockData'),
				},
			};
		}),
	};
});

describe('ApiClientProvider', () => {
	it('provides the apiClient instance to children', () => {
		const mockApiClient = {
			// Mock the methods of ApiClient as needed
		} as ApiClient;

		const TestComponent = () => {
			const apiClient = useApiClient();
			expect(apiClient).toBe(mockApiClient);
			return <MockText>Test</MockText>;
		};

		const { getByText } = render(
			<ApiClientProvider apiClient={mockApiClient}>
				<TestComponent />
			</ApiClientProvider>,
		);

		// Verify the child component renders
		const testElement = getByText('Test');
		expect(testElement).toBeTruthy();
	});

	it('throws an error when useApiClient is used outside of ApiClientProvider', () => {
		const TestComponent = () => {
			try {
				useApiClient();
			} catch (error) {
				expect(error).toEqual(
					new Error(
						'useApiClient must be used within an ApiClientProvider',
					),
				);
			}
			return <MockText>Test</MockText>;
		};

		const { getByText } = render(<TestComponent />);

		// Verify the child component renders
		const testElement = getByText('Test');
		expect(testElement).toBeTruthy();
	});

	it('allows selecting a specific part of the apiClient using a selector', () => {
		const TestComponent = () => {
			const data = useApiClient((client) =>
				client.plaid.getLinkToken(),
			);
			expect(data).toBe('mockData');
			return <MockText>Test</MockText>;
		};

		render(
			<ApiClientProvider
				apiClient={
					{
						plaid: {
							getLinkToken: jest.fn(() => 'mockData'),
							exchangePublicToken: jest.fn(() => 'mockData'),
						},
					} as any
				}>
				<TestComponent />
			</ApiClientProvider>,
		);
	});
});
