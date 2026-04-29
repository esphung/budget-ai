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
import useKeyboardShift from '../../hooks/useKeyboardShift';
import { useCallback, useMemo, useState } from 'react';
import {
	Animated,
	Keyboard,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';

const AiChatView = ({
	threadId,
	messages,
}: {
	threadId: string | null;
	messages: AIMessage[];
}) => {
	const [text, setText] = useState<string>('');
	const [isAwaitingAiResponse, setIsAwaitingAiResponse] =
		useState<boolean>(false);
	const { keyboardShift, dismissKeyboardOnTouchCapture } =
		useKeyboardShift({
			keyboardOffset: 100,
		});
	const { colors, isDarkMode } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { aiService } = useOpenAiService();
	const checkHealth = useApiClient((api) => api.health.check);
	const { backendStatus } = useBackendHealth(checkHealth);

	const onSend = useCallback(async () => {
		const trimmed = text.trim();
		if (!trimmed) return;
		Keyboard.dismiss();
		if (backendStatus === 'offline') return;
		if (isAwaitingAiResponse) return;
		setText('');
		if (threadId && aiService) {
			setIsAwaitingAiResponse(true);
			try {
				await aiService.sendMessageAndApplyActions({
					threadId: threadId,
					userText: trimmed,
				});
			} finally {
				setIsAwaitingAiResponse(false);
			}
		}
	}, [backendStatus, text, threadId, aiService, isAwaitingAiResponse]);

	const contentView = useMemo(() => {
		if (!threadId) {
			return <LoadingView message="Loading conversation thread..." />;
		}
		return (
			<View style={styles.content}>
				{![...(messages || [])].length ? (
					<LoadingView message="No messages yet." />
				) : (
					<View style={styles.messageListContainer}>
						<MessageList messages={[...(messages || [])]} />
					</View>
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
							testID="AiChatView-BackendStatus"
							style={[
								styles.statusText,
								backendStatus === 'offline' &&
									styles.statusTextOffline,
							]}>
							{isAwaitingAiResponse
								? 'AI is typing...'
								: backendStatus === 'online'
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
						blurOnSubmit={true}
						returnKeyType="send"
						submitBehavior="blurAndSubmit"
						keyboardAppearance={isDarkMode ? 'dark' : 'light'}
						testID="AiChatView-Input"
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
		threadId,
		styles.content,
		styles.messageListContainer,
		styles.composer,
		styles.statusRow,
		styles.statusDot,
		styles.statusDotOnline,
		styles.statusDotOffline,
		styles.statusText,
		styles.statusTextOffline,
		styles.input,
		messages,
		backendStatus,
		isAwaitingAiResponse,
		text,
		colors.neutral.placeholder,
		onSend,
		isDarkMode,
	]);

	return (
		<View
			testID="AiChatView-Container"
			style={styles.container}
			onStartShouldSetResponderCapture={
				dismissKeyboardOnTouchCapture
			}>
			<Animated.View
				style={[
					styles.animatedContent,
					{ transform: [{ translateY: keyboardShift }] },
				]}>
				{contentView}
			</Animated.View>
		</View>
	);
};

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		container: {
			flex: 1,
			paddingHorizontal: spacing.lg - 2,
			paddingTop: spacing.lg - 2,
			paddingBottom: spacing.md + 1,
		},
		animatedContent: {
			flex: 1,
		},
		content: {
			flex: 1,
		},
		messageListContainer: {
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
