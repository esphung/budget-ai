import { actionHandlers } from '@db/actionHandlers';
import { handleActionError } from '@db/handleActionError';
import { AIAction } from '@db/types';
import { DB } from '@op-engineering/op-sqlite';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { ApiClient } from '@services/ApiClient';
import { OpenAIAssistantResponse } from '../../shared/types/openai';

const GPT_MODEL = 'gpt-4.1-nano';

export class OpenAiService {
	private api: ApiClient;
	private db: DB;
	private repo: AIConversationRepository;

	constructor(api: ApiClient, db: DB, private logout: () => void) {
		this.api = api;
		this.db = db;
		this.repo = new AIConversationRepository(db);
	}

	private async applyAIAction({
		threadId,
		action,
	}: {
		threadId: string;
		action: AIAction;
	}) {
		const { actionType } = action;

		try {
			const handler = actionHandlers[actionType];
			if (!handler) {
				throw new Error(`Unsupported action: ${actionType}`);
			}
			await handler(
				this.db,
				this.repo,
				action,
				threadId,
				this.logout,
			);
		} catch (error) {
			await handleActionError(this.repo, { threadId, action }, error);
		}
	}

	private async processPendingAIActions({
		threadId,
	}: {
		threadId: string;
	}) {
		const actions = await this.repo.getPendingActions(threadId);

		for (const action of actions) {
			await this.applyAIAction({ threadId, action });
		}
	}

	private async sendAIMessage({
		threadId,
		userText,
	}: {
		threadId: string;
		userText: string;
	}) {
		console.log('[OpenAIService] sendAIMessage - userText:', userText);
		// 1. Save what the user said.
		await this.repo.saveMessage({
			threadId,
			role: 'user',
			messageType: 'text',
			content: userText,
		});

		// 2. Load conversation history.
		const messages = await this.repo.getMessages(threadId);

		// 3. Send to your backend/OpenAI.
		const response = await this.callAI({
			messages: messages.map((msg) => ({
				role:
					msg.role === 'tool'
						? 'assistant'
						: (msg.role as 'user' | 'assistant'), // Treat tool messages as assistant messages for context
				content: msg.content ?? '',
			})),
		});

		const parsed = response;
		console.log(
			'[OpenAIService] sendAIMessage - parsed assistant content:',
			JSON.stringify(parsed, null, 2),
		);
		// 4. Save assistant text response.
		const assistantMessageId = await this.repo.saveMessage({
			threadId,
			role: 'assistant',
			messageType: 'text',
			content: parsed.message,
			model: GPT_MODEL,
		});

		const actions = parsed.actions;
		console.log(
			'[OpenAIService] sendAIMessage - extracted actions:',
			JSON.stringify(actions, null, 2),
		);

		// 5. Save any structured actions.
		for (const action of actions || []) {
			await this.repo.saveMessage({
				threadId,
				role: 'tool',
				messageType: 'action_request',
				content: `Requested action: ${action.type}`,
				metadata: {
					action_type: action.type,
					payload: action.payload,
				},
				model: GPT_MODEL,
			});

			await this.repo.saveAction({
				threadId,
				messageId: assistantMessageId,
				actionType: action.type,
				payload: action.payload,
			});

			if (action.type === 'navigate') {
				// For navigate actions, we might want to apply them immediately to ensure the user is taken to the right screen without delay.
				await this.applyAIAction({
					threadId,
					action: {
						id: `action_${Date.now()}`,
						threadId,
						messageId: assistantMessageId,
						actionType: action.type,
						payload: action.payload,
						appliedAt: null,
						result: null,
						status: 'pending',
						createdAt: '',
					},
				});
			} else if (action.type === 'save_transaction') {
				// For save_transaction actions, we might want to wait until after processing all actions to apply them, in case there are multiple actions that need to be applied together.
				// So we can just continue here and let the processPendingAIActions function handle applying it after we've saved all actions.
				continue;
			} else if (action.type === 'logout') {
				// For logout actions, we might want to apply them immediately to log the user out without delay.
				await this.applyAIAction({
					threadId,
					action: {
						id: `action_${Date.now()}`,
						threadId,
						messageId: assistantMessageId,
						actionType: action.type,
						payload: action.payload,
						appliedAt: null,
						result: null,
						status: 'pending',
						createdAt: '',
					},
				});
				// After applying the logout action, we can return early since the user will be logged out.
				return;
			}
		}
	} // End of sendAIMessage

	async callAI(params: {
		messages: { role: 'user' | 'assistant'; content: string }[];
	}): Promise<OpenAIAssistantResponse> {
		const response = await this.api.openai.sendMessage(params.messages);
		return response;
	}

	sendMessageAndApplyActions = async ({
		threadId,
		userText,
	}: {
		threadId: string;
		userText: string;
	}) => {
		await this.sendAIMessage({ threadId, userText });
		await this.processPendingAIActions({ threadId });
	};
}
