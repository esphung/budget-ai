import { executeTransaction } from '@db/executeTransaction';
import { AIAction } from '@db/types';
import { AppStackScreens } from '@navigation/AppStack/AppStack';
import {
	isSameScreen,
	mapToAppStackScreen,
	NavigationService,
} from '@navigation/navigationService';
import { DB } from '@op-engineering/op-sqlite';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { generateUniqueId } from '@utils/randomIdUtils';

type NewTransactionParams = {
	id: string;
	amount: number;
	merchant: string | null;
	category: string | null;
	date: string;
	transactionType: 'expense' | 'income' | 'transfer';
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
		transactionType: payload.transaction_type || null,
	};
};

const goToScreen = ({ screen }: { screen: string }) => {
	const screenToNavigate = mapToAppStackScreen(screen);
	if (isSameScreen(screen)) {
		console.warn(`Already on the requested screen: ${screen}`);
		return;
	}
	console.log('Navigating to screen:', screenToNavigate);
	if (screenToNavigate) {
		NavigationService.navigateToScreen(
			screenToNavigate,
			undefined,
			screen === AppStackScreens.Home, // reset stack if navigating to Home
		);
	}
};

// ActionHandlers.ts
export const actionHandlers: Record<
	string,
	(
		db: DB,
		repo: AIConversationRepository,
		action: AIAction,
		threadId: string,
		onFinish: () => void,
	) => Promise<void>
> = {
	save_transaction: async (db, repo, action, threadId) => {
		const transactionId = generateUniqueId('txn');
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
				  transaction_type,
				  date,
				  created_at
				)
				VALUES (?, ?, ?, ?, ?, ?, ?)
				`,
				args: [
					transactionId,
					mappedPayload.amount,
					mappedPayload.merchant,
					mappedPayload.category,
					mappedPayload.transactionType,
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

		await repo.saveMessage({
			threadId,
			role: 'tool',
			messageType: 'action_result',
			content: `Navigate to ${payload.screen}`,
			metadata: {
				action_type: 'navigate',
				screen: mapToAppStackScreen(payload.screen),
			},
		});

		await repo.markActionApplied({
			actionId: action.id,
			result: { navigated_to: mapToAppStackScreen(payload.screen) },
		});

		goToScreen(payload);
	},

	logout: async (_db, repo, action, threadId, onFinish) => {
		await repo.saveMessage({
			threadId,
			role: 'tool',
			messageType: 'action_result',
			content: `Logging out...`,
			metadata: {
				action_type: 'logout',
				screen: null,
			},
		});

		await repo.markActionApplied({
			actionId: action.id,
			result: { logged_out: true },
		});

		onFinish?.();
	},
};
