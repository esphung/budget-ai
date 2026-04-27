import Panel from '@components/Panel/Panel';
import PrimaryButton from '@components/PrimaryButton';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import { useReactiveAIMessages } from '@hooks/useReactiveAIMessages';
import { DB } from '@op-engineering/op-sqlite';
import { useAuthStore } from '@providers/AuthProvider';
import { useOpSqlDb } from '@providers/DatabaseProvider';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { benchmarkService } from '@services/BenchmarkService';
import { homeScreenLog } from '@utils/logUtils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useOpenAiService } from '@providers/OpenAiServiceProvider';

const SHOW_BORDERS = true;

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
				data={[...messages]}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View style={{ marginBottom: 12 }}>
						<Text style={{ fontWeight: 'bold' }}>
							{item.role} / {item.messageType}
						</Text>
						<Text>{item.content}</Text>
					</View>
				)}
				onContentSizeChange={() => {
					setTimeout(() => {
						flatListRef.current?.scrollToEnd({
							animated: true,
						});
					}, 150);
				}}
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
	const { db } = useOpSqlDb();

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
