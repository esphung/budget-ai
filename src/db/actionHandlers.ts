import { executeTransaction } from '@db/executeTransaction';
import { AIAction } from '@db/types';
import { navigateToScreen } from '@navigation/navigateToScreen';
import { DB } from '@op-engineering/op-sqlite';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { generateUniqueId } from '@utils/randomIdUtils';

type NewTransactionParams = {
	id: string;
	amount: number;
	merchant: string | null;
	category: string | null;
	date: string;
};

const mapActionPayloadToTxnParams = (
	payload: any,
): Omit<NewTransactionParams, 'id'> => {
	// This is where you can transform the payload if needed before saving to DB
	return {
		amount: Number(payload.amount || 0),
		merchant: payload.merchant || null,
		category: payload.category || null,
		date: payload.date || new Date().toISOString(),
	};
};

// ActionHandlers.ts
export const actionHandlers: Record<
	string,
	(
		db: DB,
		repo: AIConversationRepository,
		action: AIAction,
		threadId: string,
	) => Promise<void>
> = {
	save_transaction: async (db, repo, action, threadId) => {
		const transactionId = generateUniqueId('txn_');
		const mappedPayload = mapActionPayloadToTxnParams(action.payload);
		const now = new Date().toISOString();

		// save transaction record to DB
		await executeTransaction(db, [
			{
				sql: `
				INSERT INTO transactions (
				  id,
				  amount,
				  merchant,
				  category,
				  date,
				  created_at
				)
				VALUES (?, ?, ?, ?, ?, ?)
				`,
				args: [
					transactionId,
					mappedPayload.amount,
					mappedPayload.merchant,
					mappedPayload.category,
					mappedPayload.date,
					now,
				],
			},
		]);

		// mark ai_action record as applied
		await repo.markActionApplied({
			actionId: action.id,
			result: { transaction_id: transactionId },
		});

		// save a tool message with the result; shows UI feedback
		await repo.saveMessage({
			threadId,
			role: 'tool',
			messageType: 'action_result',
			content: 'Transaction saved.',
			metadata: {
				action_type: 'save_transaction',
				transaction_id: transactionId,
			},
		});
	},
	navigate: async (_db, repo, action, threadId) => {
		const payload = action.payload as { screen: string };

		// navigate to the specified screen HERE
		// Alert.alert(`Navigate to ${payload.screen}`);
		navigateToScreen(payload.screen);

		await repo.markActionApplied({
			actionId: action.id,
			result: { navigated_to: payload.screen },
		});

		await repo.saveMessage({
			threadId,
			role: 'tool',
			messageType: 'action_result',
			content: `Navigate to ${payload.screen}`,
			metadata: {
				action_type: 'navigate',
				screen: payload.screen,
			},
		});
	},
};
