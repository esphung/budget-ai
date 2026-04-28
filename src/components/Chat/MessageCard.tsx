import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { AIMessage } from '@db/types';
import { AppColors, radius, spacing, shadows } from '@theme/tokens';

const parseContent = (content: string, textColor: string) => {
	// Keep line breaks readable in the chat bubble.
	return content.split('\n').map((line, index) => (
		<AppText key={index} style={{ marginBottom: 4, color: textColor }}>
			{line}
		</AppText>
	));
};

const MessageCard = ({ item }: { item: AIMessage }) => {
	const { colors } = useTheme();
	const styles = React.useMemo(() => createStyles(colors), [colors]);
	const isUser = item.role === 'user';
	const displayContent = item.content ?? '';
	const textColor = isUser
		? colors.chat.userText
		: colors.chat.assistantText;
	const enterProgress = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.timing(enterProgress, {
			toValue: 1,
			duration: 210,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: true,
		}).start();
	}, [enterProgress]);

	return (
		<Animated.View
			style={[
				styles.card,
				isUser ? styles.userCard : styles.assistantCard,
				{
					opacity: enterProgress,
					transform: [
						{
							translateY: enterProgress.interpolate({
								inputRange: [0, 1],
								outputRange: [6, 0],
							}),
						},
					],
				},
			]}>
			<View>{parseContent(displayContent, textColor)}</View>
		</Animated.View>
	);
};

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		card: {
			marginBottom: spacing.md,
			padding: spacing.md,
			borderRadius: radius.lg,
			maxWidth: '78%',
			...shadows.sm,
		},
		userCard: {
			alignSelf: 'flex-end',
			backgroundColor: colors.chat.user,
			borderBottomRightRadius: spacing.sm,
		},
		assistantCard: {
			alignSelf: 'flex-start',
			backgroundColor: colors.chat.assistant,
			borderBottomLeftRadius: spacing.sm,
		},
	});

export default MessageCard;
