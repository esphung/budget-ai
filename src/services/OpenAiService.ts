import { executeTransaction } from '@db/executeTransaction';
import { AIAction } from '@db/types';
import { DB } from '@op-engineering/op-sqlite';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { ApiClient } from '@services/ApiClient';
import { chatLog } from '@utils/logUtils';
import { randomId } from '@utils/randomIdUtils';
import { Alert } from 'react-native';
import type { AssistantResponse } from '../types/AssistantResponse';

export class OpenAiService {
	private api: ApiClient;
	private db: DB;

	constructor(api: ApiClient, db: DB) {
		this.api = api;
		this.db = db;
	}

	async applyAIAction(input: {
		// db: DB;
		threadId: string;
		action: AIAction;
	}) {
		chatLog.debug('Applying AI action', {
			actionId: input.action.id,
			actionType: input.action.actionType,
			threadId: input.threadId,
		});

		const repo = new AIConversationRepository(this.db);

		try {
			switch (input.action.actionType) {
				case 'save_transaction': {
					const payload = input.action.payload as {
						amount: number;
						merchant?: string;
						category?: string;
						date: string;
					};

					const transactionId = randomId();
					const now = new Date().toISOString();

					await executeTransaction(this.db, [
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
								payload.amount,
								payload.merchant ?? null,
								payload.category ?? null,
								payload.date,
								now,
							],
						},
					]);

					await repo.markActionApplied({
						actionId: input.action.id,
						result: {
							transaction_id: transactionId,
						},
					});

					await repo.saveMessage({
						threadId: input.threadId,
						role: 'tool',
						messageType: 'action_result',
						content: 'Transaction saved.',
						metadata: {
							action_type: 'save_transaction',
							transaction_id: transactionId,
						},
					});

					break;
				}

				case 'navigate': {
					// Example of another action type
					const payload = input.action.payload as {
						screen: string;
					};

					// Here you would implement navigation logic, e.g. by saving a message that the frontend listens for
					Alert.alert(`Navigate to ${payload.screen}`);

					await repo.markActionApplied({
						actionId: input.action.id,
						result: {
							navigated_to: payload.screen,
						},
					});

					await repo.saveMessage({
						threadId: input.threadId,
						role: 'tool',
						messageType: 'action_result',
						content: `Navigate to ${payload.screen}`,
						metadata: {
							action_type: 'navigate',
							screen: payload.screen,
						},
					});

					break;
				}

				default: {
					throw new Error(
						`Unsupported action: ${input.action.actionType}`,
					);
				}
			}
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Unknown action error';

			await repo.markActionFailed({
				actionId: input.action.id,
				errorMessage: message,
			});

			await repo.saveMessage({
				threadId: input.threadId,
				role: 'tool',
				messageType: 'error',
				content: message,
				metadata: {
					action_type: input.action.actionType,
				},
			});
		}
	}

	async processPendingAIActions(input: { db: DB; threadId: string }) {
		chatLog.debug(
			'[processPendingAIActions] Checking for pending AI actions',
		);
		const repo = new AIConversationRepository(input.db);

		const actions = await repo.getPendingActions(input.threadId);

		for (const action of actions) {
			await this.applyAIAction({
				// db: input.db,
				threadId: input.threadId,
				action,
			});
		}
	}

	sendMessageAndApplyActions = async (input: {
		db: DB;
		threadId: string;
		userText: string;
	}) => {
		chatLog.debug(
			'[sendMessageAndApplyActions] Sending user message to AI',
			{
				text: input.userText,
			},
		);
		await this.sendAIMessage({
			db: input.db,
			threadId: input.threadId,
			userText: input.userText,
		});

		await this.processPendingAIActions({
			db: input.db,
			threadId: input.threadId,
		});
	};

	async sendAIMessage(input: {
		db: DB;
		threadId: string;
		userText: string;
	}) {
		const repo = new AIConversationRepository(input.db);

		// 1. Save what the user said.
		chatLog.debug('[sendAIMessage] 1. Saving user message to DB');
		await repo.saveMessage({
			threadId: input.threadId,
			role: 'user',
			messageType: 'text',
			content: input.userText,
		});

		// 2. Load conversation history.
		chatLog.debug('[sendAIMessage] 2. Loading conversation history');
		const messages = await repo.getMessages(input.threadId);

		// 3. Send to your backend/OpenAI.
		chatLog.debug('[sendAIMessage] 3. Sending conversation to AI');
		const assistantResponse = await this.callAI({
			messages: messages.map((message) => ({
				// role: message.role,
				role: message.role === 'tool' ? 'assistant' : message.role,
				content: message.content ?? '',
			})),
		});

		// 4. Save assistant text response.
		chatLog.debug('[sendAIMessage] 4. Saving assistant response to DB');
		const assistantMessageId = await repo.saveMessage({
			threadId: input.threadId,
			role: 'assistant',
			messageType: 'text',
			content: assistantResponse.message,
			model: 'gpt-5.5',
		});

		// 5. Save any structured actions.
		for (const action of assistantResponse.actions ?? []) {
			chatLog.debug('[sendAIMessage] Saving assistant action to DB', {
				actionType: action.type,
				payload: action.payload,
			});
			await repo.saveMessage({
				threadId: input.threadId,
				role: 'assistant',
				messageType: 'action_request',
				content: `Requested action: ${action.type}`,
				metadata: {
					action_type: action.type,
					payload: action.payload,
				},
				model: 'gpt-5.5',
			});

			await repo.saveAction({
				threadId: input.threadId,
				messageId: assistantMessageId,
				actionType: action.type,
				payload: action.payload,
			});
		}
	}

	async callAI(params: {
		messages: Array<{
			role: string;
			content: string;
		}>;
	}): Promise<AssistantResponse> {
		chatLog.debug('[OpenAiService] callAI called with messages', {
			messagesLength: params.messages.length,
		});

		const response = await this.api.openai.sendMessage(params.messages);

		const assistantResponse: AssistantResponse = JSON.parse(
			response.data.message,
		);
		chatLog.debug(
			'[OpenAiService] Parsed AI message:',
			assistantResponse,
		);
		return assistantResponse;
	}
}
