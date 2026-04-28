import MessageList from '@components/Chat/MessageList';
import LoadingView from '@components/LoadingView/LoadingView';
import PrimaryButton from '@components/PrimaryButton';
import { AIMessage } from '@db/types';
import { useOpenAiService } from '@providers/OpenAiServiceProvider';
import { colors, radius, spacing } from '@theme/tokens';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const AiChatView = ({
	threadId,
	messages,
}: {
	threadId: string | null;
	messages: AIMessage[];
}) => {
	const [text, setText] = useState<string>('');
	const { aiService } = useOpenAiService();

	const onSend = useCallback(async () => {
		const trimmed = text.trim();
		if (!trimmed) return;
		setText('');
		if (threadId && aiService) {
			await aiService.sendMessageAndApplyActions({
				threadId: threadId,
				userText: trimmed,
			});
		}
	}, [text, threadId, aiService]);

	const contentView = useMemo(() => {
		if (!threadId) {
			return <LoadingView message="Loading conversation thread..." />;
		}
		return (
			<View style={styles.content}>
				{![...(messages || [])].length ? (
					<LoadingView message="No messages yet." />
				) : (
					<MessageList messages={[...(messages || [])]} />
				)}
				<View style={styles.composer}>
					<TextInput
						value={text}
						onChangeText={setText}
						placeholder="Type your message..."
						placeholderTextColor="#94A3B8"
						style={styles.input}
						onSubmitEditing={onSend}
						returnKeyType="send"
						submitBehavior="submit"
					/>
					<PrimaryButton
						title="Send"
						onPress={onSend}
						width="100%"
					/>
				</View>
			</View>
		);
	}, [messages, onSend, text, threadId]);

	return <View style={styles.container}>{contentView}</View>;
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: spacing.lg - 2,
		paddingTop: spacing.lg - 2,
		paddingBottom: spacing.md + 1,
	},
	content: {
		flex: 1,
	},
	composer: {
		marginTop: spacing.md - 2,
		gap: spacing.sm,
	},
	input: {
		borderWidth: 1,
		borderColor: colors.neutral.border,
		paddingHorizontal: spacing.lg - 2,
		paddingVertical: spacing.md,
		borderRadius: radius.md,
		backgroundColor: colors.neutral.surface,
		color: colors.neutral.text,
	},
});

export default AiChatView;
