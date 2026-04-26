import { TestID } from '@enums/TestID';
import AppStack from '@navigation/AppStack/AppStack';
import { AuthProvider } from '@providers/AuthProvider';
import { createAuthStore } from '@stores/AuthStore';
import { render } from '@testing-library/react-native';
import React from 'react';

// @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () => {
	return {
		AsyncStorage: {
			setItem: jest.fn(),
			getItem: jest.fn().mockResolvedValue('mock-token'),
			removeItem: jest.fn(),
		},
	};
});

jest.mock('@screens/HomeScreen/HomeScreen', () => {
	const ids = require('@enums/TestID');
	const RN = require('react-native');

	return function MockHomeScreen() {
		return <RN.View testID={ids.TestID.HomeScreen} />;
	};
});

const renderWithProviders = (ui: React.ReactElement) => {
	const authStore = createAuthStore(); // Create a real auth store with the storage instance
	return render(<AuthProvider store={authStore}>{ui}</AuthProvider>);
};

describe('AppStack', () => {
	it('renders HomeScreen', () => {
		const { getByTestId } = renderWithProviders(<AppStack />);
		const homeScreen = getByTestId(TestID.HomeScreen);
		expect(homeScreen).toBeTruthy();
	});
});
