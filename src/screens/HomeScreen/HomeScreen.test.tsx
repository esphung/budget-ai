import { TestID } from '@enums/TestID';
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

function renderWithProviders(ui: React.ReactElement) {
	return render(
		<DatabaseProvider>
			<OpenAiServiceProvider>
				<DatabaseProvider>{ui}</DatabaseProvider>
			</OpenAiServiceProvider>
		</DatabaseProvider>,
	);
}

describe('HomeScreen', () => {
	it('renders the HomeScreen', () => {
		(useAuthStore as jest.Mock).mockReturnValue({ logout: jest.fn() });

		const { getByTestId } = renderWithProviders(<HomeScreen />);

		// Check if the HomeScreen container is rendered
		const homeScreen = getByTestId(TestID.HomeScreen);
		expect(homeScreen).toBeVisible();
	});

	it('shows the loading view when threadId is null', () => {
		(useAuthStore as jest.Mock).mockReturnValue({ logout: jest.fn() });

		const { getByText } = renderWithProviders(<HomeScreen />);

		expect(getByText('Loading conversation thread...')).toBeVisible();
	});

	it('shows the loading view when there are no messages', () => {
		(useAuthStore as jest.Mock).mockReturnValue({ logout: jest.fn() });
		const { getByText } = renderWithProviders(<HomeScreen />);

		expect(getByText('Loading conversation thread...')).toBeVisible();
	});
});
