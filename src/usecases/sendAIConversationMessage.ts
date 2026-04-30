import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { CategoryRepository } from '@repositories/CategoryRepository';
import { ApiClient } from '@services/ApiClient';

const GPT_MODEL = 'gpt-4.1-nano';

type PersistedAIAction = {
	id: string;
	type: string;
	payload: Record<string, unknown>;
};

type SendAIConversationMessageParams = {
	threadId: string;
	userText: string;
};

type SendAIConversationMessageResult = {
	message: string;
	actions: PersistedAIAction[];
	assistantMessageId: string;
};

export class SendAIConversationMessage {
	constructor(
		private aiConversationRepo: AIConversationRepository,
		private api: ApiClient,
		private categoryRepo?: CategoryRepository,
	) {}

	async execute({
		threadId,
		userText,
	}: SendAIConversationMessageParams): Promise<SendAIConversationMessageResult> {
		await this.aiConversationRepo.saveMessage({
			threadId,
			role: 'user',
			messageType: 'text',
			content: userText,
		});

		const messages = await this.aiConversationRepo.getMessages(
			threadId,
		);

		const categoryNames = this.categoryRepo
			? (await this.categoryRepo.list())
					.map((category) => category.name.trim())
					.filter(Boolean)
			: [];

		const categoryGuidance = categoryNames.length
			? `When creating a save_transaction action, include payload.category and prefer one of these categories when it fits: ${categoryNames.join(
					', ',
			  )}.`
			: 'When creating a save_transaction action, always include payload.category with a concise spending category.';

		const response = await this.api.openai.sendMessage([
			{
				role: 'system',
				content: categoryGuidance,
			},
			...messages.map((message) => ({
				role:
					message.role === 'tool'
						? 'assistant'
						: (message.role as 'user' | 'assistant'),
				content: message.content ?? '',
			})),
		]);

		const assistantMessageId =
			await this.aiConversationRepo.saveMessage({
				threadId,
				role: 'assistant',
				messageType: 'text',
				content: response.message,
				model: GPT_MODEL,
			});

		const persistedActions: PersistedAIAction[] = [];

		for (const action of response.actions || []) {
			await this.aiConversationRepo.saveMessage({
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

			const persistedActionId =
				await this.aiConversationRepo.saveAction({
					threadId,
					messageId: assistantMessageId,
					actionType: action.type,
					payload: action.payload,
				});

			persistedActions.push({
				id: persistedActionId,
				type: action.type,
				payload: action.payload,
			});
		}

		return {
			message: response.message,
			actions: persistedActions,
			assistantMessageId,
		};
	}
}
