import { useEffect, useState } from 'react';
import { DB } from '@op-engineering/op-sqlite';
import { AIConversationRepository } from '@repositories/AIConversationRepository';

/**
 * Custom hook to load or create the main thread ID.
 * @param db The database instance.
 * @return An object containing the threadId and loading state.
 * @example
 * const { threadId, isLoading } = useLoadThread(db);
 * if (isLoading) {
 *   // Show loading state
 * } else {
 *   // Use threadId for fetching messages or sending new messages
 * }
 */
const useLoadThread = (
	db: DB | null,
): { threadId: string | null; isLoading: boolean } => {
	const [threadId, setThreadId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;

		async function loadThread() {
			if (!db) {
				setIsLoading(false);
				return;
			}
			const repo = new AIConversationRepository(db);
			const id: string = await repo.getOrCreateMainThread();

			if (!cancelled) {
				setThreadId(id);
				setIsLoading(false);
			}
		}

		loadThread();

		return () => {
			cancelled = true;
		};
	}, [db]);

	return {
		threadId,
		isLoading,
	};
};

export default useLoadThread;
