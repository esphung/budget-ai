import MessageList from '@components/Chat/MessageList';
import PrimaryButton from '@components/PrimaryButton';
import { AIMessage } from '@db/types';
import { DB } from '@op-engineering/op-sqlite';
import { useOpenAiService } from '@providers/OpenAiServiceProvider';
import LoadingView from '@screens/HomeScreen/LoadingView';
import { homeScreenLog } from '@utils/logUtils';
import { useCallback, useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';

const AiChatView = ({
	db,
	threadId,
	messages,
}: {
	db: DB | null;
	threadId: string | null;
	messages: AIMessage[];
}) => {
	const [text, setText] = useState<string>('');
	const { aiService } = useOpenAiService();

	const onSend = useCallback(async () => {
		homeScreenLog.debug('[onSend] Sending message:', { text });
		const trimmed = text.trim();
		if (!trimmed) return;
		setText('');
		if (threadId && db) {
			await aiService.sendMessageAndApplyActions({
				db: db,
				threadId: threadId,
				userText: trimmed,
			});
		}
	}, [text, db, threadId, aiService]);

	const contentView = useMemo(() => {
		if (!threadId) {
			return <LoadingView message="Loading conversation thread..." />;
		}

		if (![...(messages || [])].length) {
			return <LoadingView message="Waiting for messages..." />;
		}

		if (!db) {
			return <LoadingView message="Connecting to database..." />;
		}

		return (
			<View style={{ flex: 1 }}>
				<MessageList messages={[...(messages || [])]} />
				<TextInput
					value={text}
					onChangeText={setText}
					placeholder="Type your message..."
					style={{
						borderWidth: 1,
						padding: 12,
						borderRadius: 8,
						marginBottom: 8,
						marginTop: 8,
					}}
				/>
				<PrimaryButton title="Send" onPress={onSend} width="100%" />
			</View>
		);
	}, [db, messages, onSend, text, threadId]);

	return <View style={{ flex: 1, padding: 16 }}>{contentView}</View>;
};

export default AiChatView;
