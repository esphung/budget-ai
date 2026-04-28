import { StorageKey } from '@enums/StorageKey';
import { StorageService } from '@services/StorageService';
import { AppColors, darkColors, lightColors } from '@theme/tokens';
import React, {
	PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
	themeMode: ThemeMode;
	colors: AppColors;
	isDarkMode: boolean;
	setThemeMode: (mode: ThemeMode) => void;
	toggleThemeMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
	themeMode: 'light',
	colors: lightColors,
	isDarkMode: false,
	setThemeMode: () => undefined,
	toggleThemeMode: () => undefined,
});

const storage = StorageService.getInstance('@preferences');

export const ThemeProvider = ({ children }: PropsWithChildren) => {
	const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

	const setThemeMode = useCallback((mode: ThemeMode) => {
		setThemeModeState(mode);
		storage.saveItem(mode, StorageKey.ThemeMode);
	}, []);

	const toggleThemeMode = useCallback(() => {
		setThemeModeState((prev) => {
			const nextMode: ThemeMode = prev === 'light' ? 'dark' : 'light';
			storage.saveItem(nextMode, StorageKey.ThemeMode);
			return nextMode;
		});
	}, []);

	useEffect(() => {
		const hydrateThemeMode = async () => {
			const persistedThemeMode = await storage.loadItem(
				StorageKey.ThemeMode,
			);

			if (
				persistedThemeMode === 'light' ||
				persistedThemeMode === 'dark'
			) {
				setThemeModeState(persistedThemeMode);
			}
		};

		hydrateThemeMode();
	}, []);

	const value = useMemo<ThemeContextValue>(() => {
		const isDarkMode = themeMode === 'dark';
		return {
			themeMode,
			colors: isDarkMode ? darkColors : lightColors,
			isDarkMode,
			setThemeMode,
			toggleThemeMode,
		};
	}, [themeMode, setThemeMode, toggleThemeMode]);

	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);
