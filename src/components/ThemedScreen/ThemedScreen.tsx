import styles from '@components/ThemedScreen/ThemedScreen.styles';
import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ThemedScreen = ({ children }: PropsWithChildren) => {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{children}
		</View>
	);
};

export default ThemedScreen;
