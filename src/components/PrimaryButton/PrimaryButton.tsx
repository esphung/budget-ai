import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import React, { memo, useMemo } from 'react';
import {
	DimensionValue,
	StyleSheet,
	TouchableOpacity,
	ViewStyle,
} from 'react-native';
import { AppColors, radius, spacing } from '@theme/tokens';

type PrimaryButtonProps = {
	title: string;
	onPress: () => void;
	width?: DimensionValue;
	testID?: string;
	type?: 'primary' | 'secondary' | 'tertiary';
	style?: ViewStyle;
};

const PrimaryButton: React.FC<PrimaryButtonProps> = memo(
	({ title, onPress, width = 200, testID, type = 'primary', style }) => {
		const { colors, isDarkMode } = useTheme();
		const styles = useMemo(() => createStyles(colors), [colors]);

		const customStyle = useMemo(() => {
			const baseStyle = [styles.button, { width }];
			if (type === 'tertiary') {
				return StyleSheet.flatten([...baseStyle, styles.tertiary]);
			}
			const variantStyle =
				type === 'primary' ? styles.primary : styles.secondary;
			return StyleSheet.flatten([...baseStyle, variantStyle]);
		}, [width, type, styles]);

		const textStyle = useMemo(() => {
			if (type === 'tertiary') {
				return StyleSheet.flatten([
					styles.text,
					styles.tertiaryText,
				]);
			}
			if (type === 'primary') {
				return StyleSheet.flatten([
					styles.text,
					{
						color: isDarkMode
							? '#FFFFFF'
							: colors.neutral.surface,
					},
				]);
			}

			return StyleSheet.flatten([
				styles.text,
				{ color: colors.neutral.textSecondary },
			]);
		}, [
			type,
			styles,
			isDarkMode,
			colors.neutral.surface,
			colors.neutral.textSecondary,
		]);

		return (
			<TouchableOpacity
				style={StyleSheet.flatten([customStyle, style])}
				onPress={onPress}
				testID={testID}>
				<AppText style={textStyle}>{title}</AppText>
			</TouchableOpacity>
		);
	},
);

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		tertiary: {
			backgroundColor: 'transparent',
			borderColor: 'transparent',
			borderWidth: 0,
		},
		button: {
			paddingVertical: spacing.md + 1,
			paddingHorizontal: spacing.xxl,
			borderRadius: radius.md,
			alignItems: 'center',
			justifyContent: 'center',
			height: 52,
		},
		primary: {
			backgroundColor: colors.primary.base,
			shadowColor: colors.primary.base,
			shadowOffset: { width: 0, height: 8 },
			shadowOpacity: 0.2,
			shadowRadius: 16,
			elevation: 3,
		},
		secondary: {
			backgroundColor: colors.neutral.surface,
			borderColor: colors.neutral.border,
			borderWidth: 1,
		},
		text: {
			color: colors.neutral.surface,
			fontSize: 16,
			fontWeight: '700',
		},
		tertiaryText: {
			color: colors.error,
			fontWeight: '700',
		},
	});

export default PrimaryButton;
