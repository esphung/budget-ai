import { actionHandlers } from '@db/actionHandlers';
import { handleActionError } from '@db/handleActionError';
import { AIAction, Message } from '@db/types';
import { DB } from '@op-engineering/op-sqlite';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { ApiClient } from '@services/ApiClient';
import { mapAIMessageForAI } from '@utils/messageUtils';
import { OpenAIAssistantResponse } from '../../shared/types/openai';

const GPT_MODEL = 'gpt-4.1-nano';

export class OpenAiService {
	private api: ApiClient;
	private db: DB;
	private repo: AIConversationRepository;

	constructor(api: ApiClient, db: DB) {
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
			await handler(this.db, this.repo, action, threadId);
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
			messages: messages.map(mapAIMessageForAI),
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
				role: 'assistant',
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
		}
	} // End of sendAIMessage

	async callAI(params: { messages: Message[] }): Promise<OpenAIAssistantResponse> {
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
