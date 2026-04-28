import { TestID } from '@enums/TestID';
import useLoadThread from '@hooks/useLoadThread';
import { useReactiveAIMessages } from '@hooks/useReactiveAIMessages';
import { ApiClientProvider } from '@providers/ApiClientProvider';
import { useAuthStore } from '@providers/AuthProvider';
import { DatabaseProvider } from '@providers/DatabaseProvider';
import { OpenAiServiceProvider } from '@providers/OpenAiServiceProvider';
import { render } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from './HomeScreen';

jest.mock('@providers/AuthProvider', () => ({
	useAuthStore: jest.fn(),
}));

jest.mock('@services/DatabaseService', () => ({
	DatabaseService: {
		getInstance: jest.fn().mockReturnValue({
			init: jest.fn(),
			addListener: jest.fn(),
			removeListener: jest.fn(),
		}),
	},
}));

jest.mock('@hooks/useLoadThread', () => ({
	__esModule: true,
	default: jest.fn(),
}));
jest.mock('@hooks/useReactiveAIMessages');

const mockNavigation = {
	navigate: jest.fn(),
	goBack: jest.fn(),
};

const mockProps = {
	navigation: mockNavigation,
	route: { params: {} },
} as unknown as React.ComponentProps<typeof HomeScreen>;

function renderWithProviders(ui: React.ReactElement) {
	return render(
		<DatabaseProvider db={null}>
			<ApiClientProvider>
				<OpenAiServiceProvider>{ui}</OpenAiServiceProvider>
			</ApiClientProvider>
		</DatabaseProvider>,
	);
}

describe('HomeScreen', () => {
	beforeEach(() => {
		(useAuthStore as jest.Mock).mockReturnValue({ logout: jest.fn() });
	});

	it('renders the HomeScreen', () => {
		(useLoadThread as jest.Mock).mockReturnValue({
			threadId: null,
			isLoading: true,
		});
		(useReactiveAIMessages as jest.Mock).mockReturnValue([]);

		const { getByTestId } = renderWithProviders(
			<HomeScreen {...mockProps} />,
		);

		expect(getByTestId(TestID.HomeScreen)).toBeVisible();
	});

	it('shows the loading view when the thread is loading', () => {
		(useLoadThread as jest.Mock).mockReturnValue({
			threadId: null,
			isLoading: true,
		});
		(useReactiveAIMessages as jest.Mock).mockReturnValue([]);

		const { getByText } = renderWithProviders(
			<HomeScreen {...mockProps} />,
		);

		expect(getByText('Loading conversation thread...')).toBeVisible();
	});

	it('shows the empty state when the thread is loaded but has no messages', () => {
		(useLoadThread as jest.Mock).mockReturnValue({
			threadId: 'thread-1',
			isLoading: false,
		});
		(useReactiveAIMessages as jest.Mock).mockReturnValue([]);

		const { getByText } = renderWithProviders(
			<HomeScreen {...mockProps} />,
		);

		expect(getByText('No messages yet.')).toBeVisible();
	});
});
