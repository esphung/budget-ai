import { actionHandlers } from '@db/actionHandlers';
import { handleActionError } from '@db/handleActionError';
import { AIAction, Message } from '@db/types';
import { DB } from '@op-engineering/op-sqlite';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { ApiClient } from '@services/ApiClient';
import {
	mapAIMessageForAI,
	parseAssistantResponse,
} from '@utils/messageUtils';
import type { AssistantResponse } from 'types/AssistantResponse';

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
		const assistantResponse = await this.callAI({
			messages: messages.map(mapAIMessageForAI),
		});

		// 4. Save assistant text response.
		const assistantMessageId = await this.repo.saveMessage({
			threadId,
			role: 'assistant',
			messageType: 'text',
			content: assistantResponse.message,
			model: GPT_MODEL,
		});

		// 5. Save any structured actions.
		for (const action of assistantResponse.actions || []) {
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

	async callAI(params: {
		messages: Message[];
	}): Promise<AssistantResponse> {
		const response = await this.api.openai.sendMessage(params.messages);
		return parseAssistantResponse(response);
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
