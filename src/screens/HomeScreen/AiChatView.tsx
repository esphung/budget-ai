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
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	const { colors } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { aiService } = useOpenAiService();
	const checkHealth = useApiClient((api) => api.health.check);
	const { backendStatus } = useBackendHealth(checkHealth);

	useEffect(() => {
		const showEvent =
			Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
		const hideEvent =
			Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

		const showSubscription = Keyboard.addListener(
			showEvent,
			(event) => {
				setKeyboardHeight(event.endCoordinates?.height ?? 0);
			},
		);
		const hideSubscription = Keyboard.addListener(hideEvent, () => {
			setKeyboardHeight(0);
		});

		return () => {
			showSubscription?.remove?.();
			hideSubscription?.remove?.();
		};
	}, []);

	const onSend = useCallback(async () => {
		const trimmed = text.trim();
		if (!trimmed) return;
		Keyboard.dismiss();
		if (backendStatus === 'offline') return;
		setText('');
		if (threadId && aiService) {
			await aiService.sendMessageAndApplyActions({
				threadId: threadId,
				userText: trimmed,
			});
		}
	}, [backendStatus, text, threadId, aiService]);

	const dismissKeyboardOnTouchCapture = useCallback(() => {
		Keyboard.dismiss();
		return false;
	}, []);

	const contentView = useMemo(() => {
		const keyboardInset = Math.max(0, keyboardHeight - spacing.lg);

		if (!threadId) {
			return <LoadingView message="Loading conversation thread..." />;
		}
		return (
			<View
				style={[styles.content, { paddingBottom: keyboardInset }]}>
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
						blurOnSubmit={true}
						returnKeyType="send"
						submitBehavior="blurAndSubmit"
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
		keyboardHeight,
		colors.neutral.placeholder,
		messages,
		onSend,
		styles.composer,
		styles.content,
		styles.input,
		styles.messageListContainer,
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

	return (
		<View
			testID="AiChatView-Container"
			style={styles.container}
			onStartShouldSetResponderCapture={
				dismissKeyboardOnTouchCapture
			}>
			{contentView}
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
