import { AIMessage } from '@db/types';
import { DB } from '@op-engineering/op-sqlite';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { useEffect, useState } from 'react';

export function useReactiveAIMessages(db: DB, threadId: string | null) {
	const [messages, setMessages] = useState<AIMessage[]>([]);

	useEffect(() => {
		if (!threadId) {
			throw new Error(
				'[useReactiveAIMessages] threadId is required to fetch messages',
			);
		}

		const repo = new AIConversationRepository(db);

		const fetchMessages = async () => {
			const initialMessages = await repo.getMessages(threadId);
			setMessages(initialMessages);
		};

		const setupReactiveListener = () => {
			return db.reactiveExecute({
				query: `
				SELECT *
				FROM ai_messages
				WHERE thread_id = ?
				ORDER BY created_at ASC
			`,
				arguments: [threadId],
				fireOn: [{ table: 'ai_messages' }, { table: 'ai_actions' }],
				callback: async () => {
					const nextMessages = await repo.getMessages(threadId);
					setMessages(nextMessages);
				},
			});
		};

		fetchMessages();
		const unsubscribe = setupReactiveListener();

		return () => {
			unsubscribe?.();
		};
	}, [db, threadId]);

	return messages;
}
