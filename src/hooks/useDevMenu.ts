import { useEffect } from 'react';
import { DevSettings } from 'react-native';

type DebugState = {
	token: string | null;
};

export const useDevMenu = ({
	onLogout,
	getDebugState,
}: {
	onLogout: () => void;
	getDebugState: () => DebugState;
}) => {
	useEffect(() => {
		if (!__DEV__) {
			return;
		}

		DevSettings.addMenuItem('Reset Auth Token', onLogout);
		DevSettings.addMenuItem('Print Debug State', () => {
			console.log('Debug State:', getDebugState());
		});
	}, [onLogout, getDebugState]);
};
