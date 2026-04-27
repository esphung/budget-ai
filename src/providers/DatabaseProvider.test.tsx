import { DatabaseProvider, useOpSqlDb } from '@providers/DatabaseProvider';
import { render, renderHook } from '@testing-library/react-native';
import React from 'react';

jest.mock('@services/DatabaseService', () => {
	const mockInstance = {
		isReady: false,
		init: jest.fn(() => {
			mockInstance.isReady = true;
		}),
		reinitializeDb: jest.fn(),
		getDbPath: jest.fn(() => '/mock/path/to/db'),
		getDebugInfo: jest.fn(() => ({ debug: 'info' })),
		runMigrations: jest.fn(),
		addListener: jest.fn(),
		removeListener: jest.fn(),
	};
	return {
		DatabaseService: {
			getInstance: jest.fn(() => mockInstance),
		},
	};
});

describe('DatabaseProvider', () => {
	it('provides the DatabaseService and isReady state', () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<DatabaseProvider>{children}</DatabaseProvider>
		);

		const { result } = renderHook(() => useOpSqlDb(), { wrapper });

		expect(result.current.db).toBeDefined();
	});

	it('throws an error when useOpSqlDb is used outside of the provider', () => {
		const consoleErrorSpy = jest
			.spyOn(console, 'error')
			.mockImplementation(() => {});
		const TestComponent = () => {
			useOpSqlDb();
			return null;
		};

		expect(() => render(<TestComponent />)).toThrow(
			'useOpSqlDb must be used within an DatabaseProvider',
		);

		consoleErrorSpy.mockRestore();
	});

	it('initializes the database on mount', () => {
		const mockService =
			require('@services/DatabaseService').DatabaseService.getInstance();
		const initSpy = jest.spyOn(mockService, 'init');

		render(
			<DatabaseProvider>
				<></>
			</DatabaseProvider>,
		);

		expect(initSpy).toHaveBeenCalledTimes(1);
		expect(mockService.isReady).toBe(true);
	});

	it('adds and removes listeners correctly', () => {
		const mockService =
			require('@services/DatabaseService').DatabaseService.getInstance();
		const addListenerSpy = jest.spyOn(mockService, 'addListener');
		const removeListenerSpy = jest.spyOn(mockService, 'removeListener');

		const { unmount } = render(
			<DatabaseProvider>
				<></>
			</DatabaseProvider>,
		);

		expect(addListenerSpy).toHaveBeenCalledTimes(1);
		expect(removeListenerSpy).toHaveBeenCalledTimes(0);

		unmount();

		expect(removeListenerSpy).toHaveBeenCalledTimes(1);
	});
});
