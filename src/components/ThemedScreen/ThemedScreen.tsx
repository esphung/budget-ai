import styles from '@components/ThemedScreen/ThemedScreen.styles';
import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ThemedScreen = ({
	children,
	testID,
}: PropsWithChildren<{ testID?: string }>) => {
	const insets = useSafeAreaInsets();
	return (
		<View
			style={[
				styles.container,
				{ paddingTop: insets.top, paddingBottom: insets.bottom },
			]}
			testID={testID}>
			{children}
		</View>
	);
};

export default ThemedScreen;
