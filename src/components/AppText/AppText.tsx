import { useTheme } from '@providers/ThemeProvider';
import { typography } from '@theme/tokens';
import React from 'react';
import {
	StyleProp,
	StyleSheet,
	Text as RNText,
	TextProps,
	TextStyle,
} from 'react-native';

type TypographyVariant = keyof typeof typography;

type AppTextProps = TextProps & {
	variant?: TypographyVariant;
	color?: string;
	style?: StyleProp<TextStyle>;
};

const AppText: React.FC<AppTextProps> = ({
	variant = 'body',
	color,
	style,
	children,
	...rest
}) => {
	const { colors } = useTheme();
	const resolvedColor = color ?? colors.neutral.text;

	return (
		<RNText
			style={StyleSheet.flatten([
				typography[variant],
				{ color: resolvedColor },
				style,
			])}
			{...rest}>
			{children}
		</RNText>
	);
};

export default AppText;
