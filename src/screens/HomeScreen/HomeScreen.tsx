import Panel from '@components/Panel/Panel';
import PrimaryButton from '@components/PrimaryButton';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import { useReactiveAIMessages } from '@hooks/useReactiveAIMessages';
import { DB } from '@op-engineering/op-sqlite';
import { useAuthStore } from '@providers/AuthProvider';
import { useDatabase } from '@providers/DatabaseProvider';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { benchmarkService } from '@services/BenchmarkService';
import { homeScreenLog } from '@utils/logUtils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useOpenAiService } from '@providers/OpenAiServiceProvider';
import { AIMessage } from '@db/types';

const SHOW_BORDERS = true;

// sort in descending order by createdAt
const sortMessagesByCreatedAt = (messages: AIMessage[]) => {
	return messages.sort((a, b) => {
		if (!a.createdAt) return 1;
		if (!b.createdAt) return -1;
		return (
			new Date(b.createdAt).getTime() -
			new Date(a.createdAt).getTime()
		);
	});
};

const MessageCard = ({ item }: { item: AIMessage }) => {
	const isUser = item.role === 'user';
	return (
		<View
			style={{
				marginBottom: 12,
				alignSelf: isUser ? 'flex-end' : 'flex-start',
				backgroundColor: isUser ? '#007AFF' : '#E5E5EA',
				padding: 12,
				borderRadius: 16,
				maxWidth: '75%',
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.2,
				shadowRadius: 1.41,
				elevation: 2,
			}}>
			<Text style={{ color: isUser ? '#FFFFFF' : '#000000' }}>
				{item.content}
			</Text>
		</View>
	);
};

const AiChatView = ({ db, threadId }: { db: DB; threadId: string }) => {
	const [text, setText] = useState<string>('');
	const messages = useReactiveAIMessages(db, threadId);
	const flatListRef = useRef<FlatList>(null);
	const { aiService } = useOpenAiService();

	const onSend = useCallback(async () => {
		homeScreenLog.debug('[onSend] User sent message', {
			text,
		});
		const trimmed = text.trim();
		if (!trimmed) {
			return;
		}
		setText('');
		if (threadId) {
			await aiService.sendMessageAndApplyActions({
				db: db,
				threadId: threadId,
				userText: trimmed,
			});
		}
	}, [text, db, threadId, aiService]);

	const transformedMessages = useMemo(() => {
		const sorted = sortMessagesByCreatedAt(messages);
		return sorted;
	}, [messages]);

	// TODO: handle loading states and errors in the UI
	if (!threadId) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
				}}>
				<Text>Loading thread...</Text>
			</View>
		);
	}

	return (
		<View style={{ flex: 1, padding: 16 }}>
			<FlatList
				ref={flatListRef}
				data={[...transformedMessages]}
				keyExtractor={(item) => item.id}
				inverted
				renderItem={({ item }) => <MessageCard item={item} />}
			/>
			<TextInput
				value={text}
				onChangeText={setText}
				placeholder="Tell AI what happened..."
				style={{
					borderWidth: 1,
					padding: 12,
					borderRadius: 8,
					marginBottom: 8,
				}}
			/>
			<PrimaryButton title="Send" onPress={onSend} />
		</View>
	);
};

const HomeScreen = () => {
	const { logout } = useAuthStore();
	const { db } = useDatabase();

	const [threadId, setThreadId] = useState<string | null>(null);

	// stop benchmark when HomeScreen mounts
	useEffect(() => {
		benchmarkService.stop('bootstrap');
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function loadThread() {
			if (!db) {
				return;
			}
			const repo = new AIConversationRepository(db);
			const id: string = await repo.getOrCreateMainThread();

			if (!cancelled) {
				setThreadId(id);
			}
		}

		loadThread();

		return () => {
			cancelled = true;
		};
	}, [db, setThreadId]);

	return (
		<ThemedScreen testID={TestID.HomeScreen}>
			<Panel type="north" showBorder={SHOW_BORDERS} />
			<Panel type="center" showBorder={SHOW_BORDERS}>
				{db && threadId ? (
					<AiChatView threadId={threadId} db={db} />
				) : (
					<Text>Loading database...</Text>
				)}
			</Panel>
			<Panel
				type="south"
				style={styles.southPanel}
				showBorder={SHOW_BORDERS}>
				<PrimaryButton
					type="tertiary"
					title="Logout"
					onPress={logout}
					testID={TestID.LogoutButton}
				/>
			</Panel>
		</ThemedScreen>
	);
};

const styles = StyleSheet.create({
	southPanel: {
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default HomeScreen;
