import {
	OpenAiServiceProvider,
	useOpenAiService,
} from '@providers/OpenAiServiceProvider';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

jest.mock('@services/OpenAiService', () => {
	return {
		OpenAiService: jest.fn().mockImplementation(() => ({})),
	};
});

describe('OpenAiServiceProvider', () => {
	it('provides the OpenAiService context to its children', () => {
		const MockChild = () => {
			const openAiService = useOpenAiService();
			expect(openAiService).toBeDefined();
			return <Text>Mock Child</Text>;
		};

		render(
			<OpenAiServiceProvider>
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
