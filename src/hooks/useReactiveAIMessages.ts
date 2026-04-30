import { AIMessage } from '@db/types';
import { DB } from '@op-engineering/op-sqlite';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { useEffect, useState } from 'react';

export function useReactiveAIMessages(
	db: DB,
	threadId: string | null,
): { messages: AIMessage[]; isLoaded: boolean } {
	const [messages, setMessages] = useState<AIMessage[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		if (!threadId) {
			return;
		}

		const repo = new AIConversationRepository(db);

		const fetchMessages = async () => {
			const initialMessages = await repo.getMessages(threadId);
			setMessages(initialMessages);
			setIsLoaded(true);
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

	return { messages: [...messages], isLoaded };
}
