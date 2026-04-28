import { useTheme } from '@providers/ThemeProvider';
import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ThemedScreen = ({
	children,
	testID,
}: PropsWithChildren<{ testID?: string }>) => {
	const insets = useSafeAreaInsets();
	const { colors } = useTheme();
	return (
		<View
			style={[
				{
					flex: 1,
					backgroundColor: colors.neutral.background,
				},
				{ paddingTop: insets.top, paddingBottom: insets.bottom },
			]}
			testID={testID}>
			{children}
		</View>
	);
};

export default ThemedScreen;
