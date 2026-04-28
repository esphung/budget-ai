import AppText from '@components/AppText/AppText';
import MessageList from '@components/Chat/MessageList';
import LoadingView from '@components/LoadingView/LoadingView';
import PrimaryButton from '@components/PrimaryButton';
import { AIMessage } from '@db/types';
import { useBackendHealth } from '@hooks/useBackendHealth';
import { useApiClient } from '@providers/ApiClientProvider';
import { useTheme } from '@providers/ThemeProvider';
import { useOpenAiService } from '@providers/OpenAiServiceProvider';
import { AppColors, radius, spacing, typography } from '@theme/tokens';
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
	const { colors } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { aiService } = useOpenAiService();
	const checkHealth = useApiClient((api) => api.health.check);
	const { backendStatus } = useBackendHealth(checkHealth);

	const onSend = useCallback(async () => {
		const trimmed = text.trim();
		if (!trimmed) return;
		if (backendStatus === 'offline') return;
		setText('');
		if (threadId && aiService) {
			await aiService.sendMessageAndApplyActions({
				threadId: threadId,
				userText: trimmed,
			});
		}
	}, [backendStatus, text, threadId, aiService]);

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
					<View style={styles.statusRow}>
						<View
							style={[
								styles.statusDot,
								backendStatus === 'online' &&
									styles.statusDotOnline,
								backendStatus === 'offline' &&
									styles.statusDotOffline,
							]}
						/>
						<AppText
							style={[
								styles.statusText,
								backendStatus === 'offline' &&
									styles.statusTextOffline,
							]}>
							{backendStatus === 'online'
								? 'AI online'
								: backendStatus === 'offline'
								? 'AI temporarily unavailable'
								: 'Checking AI connection...'}
						</AppText>
					</View>
					<TextInput
						value={text}
						onChangeText={setText}
						placeholder="Type your message..."
						placeholderTextColor={colors.neutral.placeholder}
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
	}, [
		colors.neutral.placeholder,
		messages,
		onSend,
		styles.composer,
		styles.content,
		styles.input,
		styles.statusDot,
		styles.statusDotOffline,
		styles.statusDotOnline,
		styles.statusRow,
		styles.statusText,
		styles.statusTextOffline,
		text,
		threadId,
		backendStatus,
	]);

	return <View style={styles.container}>{contentView}</View>;
};

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
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
		statusRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: spacing.sm,
			paddingHorizontal: spacing.xs,
		},
		statusDot: {
			width: 10,
			height: 10,
			borderRadius: radius.full,
			backgroundColor: colors.warning,
		},
		statusDotOnline: {
			backgroundColor: colors.success,
		},
		statusDotOffline: {
			backgroundColor: colors.error,
		},
		statusText: {
			...typography.small,
			color: colors.neutral.textSecondary,
		},
		statusTextOffline: {
			color: colors.error,
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
