import { ApiClient } from '@services/ApiClient';
import { OpenAiService } from '@services/OpenAiService';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import {
	OpenAiServiceProvider,
	useOpenAiService,
} from './OpenAiServiceProvider';
import { Text } from 'react-native';

jest.mock('@services/ApiClient');
jest.mock('@services/OpenAiService');

describe('OpenAiServiceProvider', () => {
	it('provides the OpenAiService context to its children', () => {
		const MockChild = () => {
			const openAiService = useOpenAiService();
			expect(openAiService).toBeInstanceOf(OpenAiService);
			return <Text>Mock Child</Text>;
		};

		const mockApiClient = new ApiClient('http://localhost:3001');

		render(
			<OpenAiServiceProvider apiClient={mockApiClient}>
				<MockChild />
			</OpenAiServiceProvider>,
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
