import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useCallback,
	useEffect,
} from 'react';
import { DevSettings } from 'react-native';

// Define the shape of the context state
interface FeatureFlagsContextProps {
	flags: Record<string, boolean>;
	setFlag: (key: string, value: boolean) => void;
	evaluteFlag: (key: string) => boolean;
}

// Create the context
const FeatureFlagsContext = createContext<
	FeatureFlagsContextProps | undefined
>(undefined);

// Provider component
export const FeatureFlagsProvider: React.FC<{
	children: ReactNode;
	initialFlags?: Record<string, boolean>;
}> = ({ children, initialFlags = {} }) => {
	const [flags, setFlags] =
		useState<Record<string, boolean>>(initialFlags);

	const setFlag = useCallback((key: string, value: boolean) => {
		setFlags((prevFlags) => ({ ...prevFlags, [key]: value }));
	}, []);

	const evaluteFlag = useCallback(
		(key: string): boolean => {
			return flags[key] ?? false;
		},
		[flags],
	);

	// add dev menu options for toggling flags
	useEffect(() => {
		if (__DEV__) {
			DevSettings.addMenuItem('Toggle newChatEnabled', () => {
				setFlag('newChatEnabled', !flags.newChatEnabled);
			});
			DevSettings.addMenuItem('Show All Flags', () => {
				const allFlags = Object.entries(flags)
					.map(([key, value]) => `${key}: ${value}`)
					.join('\n');
				console.log('Current Feature Flags:\n', allFlags);
			});
		}
	}, [flags, setFlag]);

	return (
		<FeatureFlagsContext.Provider
			value={{ flags, setFlag, evaluteFlag }}>
			{children}
		</FeatureFlagsContext.Provider>
	);
};

// Custom hook for evaluating a specific flag
export const useEvaluateFlag = (key: string): boolean => {
	const context = useContext(FeatureFlagsContext);
	if (!context) {
		throw new Error(
			'useEvaluateFlag must be used within a FeatureFlagsProvider',
		);
	}
	return context.evaluteFlag(key);
};

export const useFeatureFlags = () => {
	const context = useContext(FeatureFlagsContext);
	if (!context) {
		throw new Error(
			'useFeatureFlags must be used within a FeatureFlagsProvider',
		);
	}
	return context;
};
