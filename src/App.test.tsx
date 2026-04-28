import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

jest.mock('@enums/TestID', () => ({
	__esModule: true,
	TestID: {
		RootStack: 'root-stack',
	},
}));

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

// '@react-native-async-storage/async-storage';
jest.mock('@react-native-async-storage/async-storage', () => ({
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn(),
}));

jest.mock('@navigation/RootStack/RootStack', () => {
	// eslint-disable-next-line @typescript-eslint/no-shadow
	const React = require('react');
	const { View } = require('react-native');
	const MockTestID = jest.requireActual('@enums/TestID').TestID;
	return {
		__esModule: true,
		default: () =>
			React.createElement(View, { testID: MockTestID.RootStack }),
	};
});

// mock useDevMenu hook
jest.mock('@hooks/useDevMenu', () => ({
	useDevMenu: jest.fn(),
}));

// mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
	SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
		children,
}));

// mock BenchmarkService
jest.mock('@services/BenchmarkService', () => ({
	benchmarkService: {
		start: jest.fn(),
	},
}));

describe('App', () => {
	it('renders the RootStack component', () => {
		const MockTestID = jest.requireActual('@enums/TestID').TestID;
		const { getByTestId } = render(<App />);
		const rootStack = getByTestId(MockTestID.RootStack);
		expect(rootStack).toBeTruthy();
	});
});
