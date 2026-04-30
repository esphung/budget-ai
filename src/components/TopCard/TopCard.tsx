import { useTheme } from '@providers/ThemeProvider';
import { radius, shadows, spacing } from '@theme/tokens';
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type TopCardProps = {
	children: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	testID?: string;
};

const TopCard = ({ children, style, testID }: TopCardProps) => {
	const { colors } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View testID={testID} style={[styles.container, style]}>
			{children}
		</View>
	);
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
	StyleSheet.create({
		container: {
			width: '100%',
			maxWidth: 480,
			alignSelf: 'center',
			backgroundColor: colors.neutral.surface,
			borderRadius: radius.lg,
			paddingVertical: spacing.xl,
			paddingHorizontal: spacing.lg,
			marginBottom: spacing.lg,
			...shadows.xl,
		},
	});

export default TopCard;
