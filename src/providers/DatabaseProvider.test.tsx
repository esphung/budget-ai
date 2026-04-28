import { DB } from '@op-engineering/op-sqlite';
import { DatabaseProvider, useDatabase } from '@providers/DatabaseProvider';
import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { DevSettings, Text } from 'react-native';

jest.mock('@utils/logUtils', () => ({
	dbLog: {
		debug: jest.fn(),
	},
}));

const mockDb = {
	getDbPath: jest.fn(() => '/tmp/budgetai.db'),
} as unknown as DB;

const StateProbe = () => {
	const store = useDatabase();
	return (
		<Text>{`hasDb:${String(!!store.db)};init:${String(
			store.isInitializing,
		)}`}</Text>
	);
};

describe('DatabaseProvider', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('throws when useDatabase is used outside provider', () => {
		const consoleErrorSpy = jest
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		const OutsideConsumer = () => {
			useDatabase();
			return <Text>outside</Text>;
		};

		expect(() => render(<OutsideConsumer />)).toThrow(
			'Missing DatabaseProvider',
		);

		consoleErrorSpy.mockRestore();
	});

	it('provides db and resolves initializing state when db exists', async () => {
		const { getByText } = render(
			<DatabaseProvider db={mockDb}>
				<StateProbe />
			</DatabaseProvider>,
		);

		await waitFor(() => {
			expect(getByText('hasDb:true;init:false')).toBeTruthy();
		});
	});

	it('keeps initializing true when db is null', () => {
		const { getByText } = render(
			<DatabaseProvider db={null}>
				<StateProbe />
			</DatabaseProvider>,
		);

		expect(getByText('hasDb:false;init:true')).toBeTruthy();
	});

	it('supports selector usage in useDatabase', async () => {
		const SelectorProbe = () => {
			const isReady = useDatabase((store) => !store.isInitializing);
			return <Text>{`ready:${String(isReady)}`}</Text>;
		};

		const { getByText } = render(
			<DatabaseProvider db={mockDb}>
				<SelectorProbe />
			</DatabaseProvider>,
		);

		await waitFor(() => {
			expect(getByText('ready:true')).toBeTruthy();
		});
	});

	it('transitions from initializing to ready when db appears', async () => {
		const { getByText, rerender } = render(
			<DatabaseProvider db={null}>
				<StateProbe />
			</DatabaseProvider>,
		);

		expect(getByText('hasDb:false;init:true')).toBeTruthy();

		rerender(
			<DatabaseProvider db={mockDb}>
				<StateProbe />
			</DatabaseProvider>,
		);

		await waitFor(() => {
			expect(getByText('hasDb:true;init:false')).toBeTruthy();
		});
	});

	it('registers debug menu item and logs db debug info when invoked', async () => {
		const {
			dbLog: { debug },
		} = require('@utils/logUtils');

		const addMenuItemSpy = jest
			.spyOn(DevSettings, 'addMenuItem')
			.mockImplementation(() => {});

		render(
			<DatabaseProvider db={mockDb}>
				<StateProbe />
			</DatabaseProvider>,
		);

		await waitFor(() => {
			expect(addMenuItemSpy.mock.calls.length).toBeGreaterThan(0);
		});

		const [, menuAction] = addMenuItemSpy.mock.calls.at(-1) as [
			string,
			() => void,
		];
		menuAction();

		expect(debug).toHaveBeenCalledWith(
			'Print Database Debug:',
			expect.objectContaining({
				path: '/tmp/budgetai.db',
				ready: true,
				isInitializing: false,
			}),
		);
	});
});
