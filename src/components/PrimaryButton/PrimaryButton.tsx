import React, { memo, useMemo } from 'react';
import {
	DimensionValue,
	StyleSheet,
	Text,
	TouchableOpacity,
} from 'react-native';

type PrimaryButtonProps = {
	title: string;
	onPress: () => void;
	width?: DimensionValue;
	testID?: string;
	type?: 'primary' | 'secondary' | 'tertiary';
};

const PrimaryButton: React.FC<PrimaryButtonProps> = memo(
	({ title, onPress, width = 200, testID, type = 'primary' }) => {
		const customStyle = useMemo(() => {
			const baseStyle = [styles.button, { width }];
			if (type === 'tertiary') {
				return StyleSheet.flatten([...baseStyle, styles.tertiary]);
			}
			const variantStyle =
				type === 'primary' ? styles.primary : styles.secondary;
			return StyleSheet.flatten([...baseStyle, variantStyle]);
		}, [width, type]);

		const textStyle = useMemo(() => {
			if (type === 'tertiary') {
				return StyleSheet.flatten([
					styles.text,
					styles.tertiaryText,
				]);
			}
			return type === 'primary'
				? styles.text
				: StyleSheet.flatten([styles.text, { color: '#6C757D' }]);
		}, [type]);

		return (
			<TouchableOpacity
				style={customStyle}
				onPress={onPress}
				testID={testID}>
				<Text style={textStyle}>{title}</Text>
			</TouchableOpacity>
		);
	},
);

const styles = StyleSheet.create({
	tertiary: {
		backgroundColor: 'transparent',
		borderColor: 'transparent',
		borderWidth: 0,
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		height: 48,
	},
	primary: {
		backgroundColor: '#007BFF',
	},
	secondary: {
		backgroundColor: 'white',
		borderColor: '#6C757D',
		borderWidth: 1,
	},
	text: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	tertiaryText: {
		color: 'red',
	},
});

export default PrimaryButton;
