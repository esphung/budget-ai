import { TestID } from '@enums/TestID';
import AppStack from '@navigation/AppStack/AppStack';
import { AuthProvider } from '@providers/AuthProvider';
import { StorageService } from '@services/StorageService';
import { render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@screens/HomeScreen/HomeScreen', () => {
	const ids = require('@enums/TestID');
	const RN = require('react-native');

	return function MockHomeScreen() {
		return <RN.View testID={ids.TestID.HomeScreen} />;
	};
});

const renderWithProviders = (ui: React.ReactElement) => {
	const authStore = {
		getInitialState: jest.fn(() => ({})), // Mock getInitialState
		createActions: jest.fn(() => ({})), // Mock createActions
	} as any;
	const authStorage = StorageService.getInstance('@budgetai_auth_token'); // Use the actual storage instance
	return render(
		<AuthProvider store={authStore} storage={authStorage}>
			{ui}
		</AuthProvider>,
	);
};

describe('AppStack', () => {
	it('renders HomeScreen', () => {
		const { getByTestId } = renderWithProviders(<AppStack />);
		const homeScreen = getByTestId(TestID.HomeScreen);
		expect(homeScreen).toBeTruthy();
	});

	it('renders AppStack container with correct styles', () => {
		const { getByTestId } = renderWithProviders(<AppStack />);
		const container = getByTestId(TestID.AppStack);
		expect(container).toHaveStyle({
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		});
	});
});
