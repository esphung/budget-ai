import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ThemedScreen = ({ children }: PropsWithChildren) => {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.container, { paddingTop: insets.top }]}>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default ThemedScreen;
