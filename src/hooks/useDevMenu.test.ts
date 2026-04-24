import { useDevMenu } from '@hooks/useDevMenu';
import { renderHook } from '@testing-library/react-native';
import { DevSettings } from 'react-native';

describe('useDevMenu', () => {
	const originalDevFlag = (global as any).__DEV__;

	afterEach(() => {
		(global as any).__DEV__ = originalDevFlag;
		jest.restoreAllMocks();
	});

	it('registers reset token menu item in dev mode', () => {
		(global as any).__DEV__ = true;
		const addMenuItemSpy = jest
			.spyOn(DevSettings, 'addMenuItem')
			.mockImplementation(() => {});

		renderHook(() =>
			useDevMenu({
				onLogout: jest.fn(),
				getDebugState: () => ({ token: null }),
			}),
		);

		expect(addMenuItemSpy).toHaveBeenCalledWith(
			'Reset Auth Token',
			expect.any(Function),
		);
	});

	it('resets auth token when the menu callback is pressed', () => {
		(global as any).__DEV__ = true;
		const onLogout = jest.fn();
		const getDebugState = jest.fn(() => ({ token: 'test-token' }));
		const addMenuItemSpy = jest
			.spyOn(DevSettings, 'addMenuItem')
			.mockImplementation(() => {});

		renderHook(() => useDevMenu({ onLogout, getDebugState }));

		const resetTokenHandler = addMenuItemSpy.mock
			.calls[0][1] as () => void;
		const debugStateHandler = addMenuItemSpy.mock
			.calls[1][1] as () => void;

		resetTokenHandler();
		debugStateHandler();

		expect(onLogout).toHaveBeenCalledTimes(1);
		expect(getDebugState).toHaveBeenCalled();
	});

	it('does not register a menu item outside dev mode', () => {
		(global as any).__DEV__ = false;
		const addMenuItemSpy = jest
			.spyOn(DevSettings, 'addMenuItem')
			.mockImplementation(() => {});

		renderHook(() =>
			useDevMenu({
				onLogout: jest.fn(),
				getDebugState: () => ({ token: null }),
			}),
		);

		expect(addMenuItemSpy).not.toHaveBeenCalled();
	});
});
