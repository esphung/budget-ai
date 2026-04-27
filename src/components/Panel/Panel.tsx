import { PropsWithChildren, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type PanelType = 'north' | 'center' | 'south';

const Panel = ({
	children,
	type,
	style,
	showBorder = false,
	testID,
}: PropsWithChildren<{
	type: PanelType;
	style?: ViewStyle;
	showBorder?: boolean;
	testID?: string;
}>) => {
	const panelStyles = useMemo(() => {
		const customStyles = [
			styles[type],
			showBorder ? styles.border : null,
			style,
		];
		const flattenedStyles = StyleSheet.flatten(customStyles);
		return flattenedStyles;
	}, [type, showBorder, style]);

	return (
		<View style={panelStyles} testID={testID}>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	north: {
		flex: 1,
	},
	center: {
		flex: 2,
	},
	south: {
		flex: 1,
	},
	border: {
		borderWidth: 1,
	},
});

export default Panel;
