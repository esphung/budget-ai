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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Animated,
	Keyboard,
	Platform,
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
	const keyboardShift = useRef(new Animated.Value(0)).current;
	const { colors, isDarkMode } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { aiService } = useOpenAiService();
	const checkHealth = useApiClient((api) => api.health.check);
	const { backendStatus } = useBackendHealth(checkHealth);

	const animateKeyboardShift = useCallback(
		(keyboardHeight: number, duration?: number) => {
			// const offset = Math.max(0, keyboardHeight - spacing.lg);
			const offset = Math.max(0, keyboardHeight - spacing.lg - 80);
			const durationMs =
				typeof duration === 'number'
					? duration < 10
						? Math.round(duration * 1000)
						: Math.round(duration)
					: 220;

			Animated.timing(keyboardShift, {
				toValue: -offset,
				duration: durationMs,
				useNativeDriver: true,
			}).start();
		},
		[keyboardShift],
	);

	useEffect(() => {
		const showEvent =
			Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
		const hideEvent =
			Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

		const showSubscription = Keyboard.addListener(
			showEvent,
			(event) => {
				animateKeyboardShift(
					event.endCoordinates?.height ?? 0,
					event.duration,
				);
			},
		);
		const hideSubscription = Keyboard.addListener(
			hideEvent,
			(event) => {
				animateKeyboardShift(0, event.duration);
			},
		);

		return () => {
			showSubscription?.remove?.();
			hideSubscription?.remove?.();
		};
	}, [animateKeyboardShift]);

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

	const dismissKeyboardOnTouchCapture = useCallback(() => {
		Keyboard.dismiss();
		return false;
	}, []);

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
							style={[
								styles.statusText,
								backendStatus === 'offline' &&
									styles.statusTextOffline,
							]}
							testID={
								isAwaitingAiResponse
									? 'AiChatView-TypingIndicator'
									: undefined
							}>
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
