import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AIMessage } from '@db/types';
import { colors, radius, spacing, shadows } from '@theme/tokens';

const parseContent = (content: string, textColor: string) => {
	// Keep line breaks readable in the chat bubble.
	return content.split('\n').map((line, index) => (
		<Text key={index} style={{ marginBottom: 4, color: textColor }}>
			{line}
		</Text>
	));
};

const MessageCard = ({ item }: { item: AIMessage }) => {
	const isUser = item.role === 'user';
	const displayContent = item.content ?? '';
	const textColor = isUser ? '#FFFFFF' : '#000000';

	return (
		<View
			style={[
				styles.card,
				isUser ? styles.userCard : styles.assistantCard,
			]}>
			<View>{parseContent(displayContent, textColor)}</View>
		</View>
	);
};

const styles = StyleSheet.create({
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
