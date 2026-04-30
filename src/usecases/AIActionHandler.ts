import { handleActionError } from '@db/handleActionError';
import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { TransactionRepository } from '@repositories/TransactionRepository';
import { ApiClient } from '@services/ApiClient';
import { CreateTransactionFromAI } from '@usecases/createTransactionFromAI';
import { ExecuteAIAction } from '@usecases/executeAIAction';
import { normalizeAIActionPayload } from '@usecases/normalizeAIActionPayload';
import { SendAIConversationMessage } from '@usecases/sendAIConversationMessage';
import { ErrorTools } from '@utils/ErrorTools';
import { aiLog } from '@utils/logUtils';
import type { AIAction } from 'types/AIAction';

export class AIActionHandler {
	private executeAIAction: ExecuteAIAction;
	private sendAIConversationMessage: SendAIConversationMessage;

	constructor(
		private aiConversationRepo: AIConversationRepository,
		transactionRepo: TransactionRepository,
		api: ApiClient,
	) {
		const createTransaction = new CreateTransactionFromAI(
			transactionRepo,
		);
		this.executeAIAction = new ExecuteAIAction(
			aiConversationRepo,
			createTransaction,
		);
		this.sendAIConversationMessage = new SendAIConversationMessage(
			aiConversationRepo,
			api,
		);
	}

	async handle(action: AIAction, rawUserText?: string) {
		return this.executeAIAction.execute(action, rawUserText);
	}

	private async applyAIAction({
		threadId,
		action,
	}: {
		threadId: string;
		action: AIAction;
	}) {
		try {
			const handlerResponse = await this.handle(action);
			aiLog.info(
				`AI action handler response: ${JSON.stringify(
					handlerResponse,
				)}`,
			);
		} catch (error) {
			const errorMessage = ErrorTools.extractErrorMessage(error);
			aiLog.error(`Error applying AI action: ${errorMessage}`);
			await handleActionError(
				this.aiConversationRepo,
				{ threadId, action },
				error,
			);
		}
	}

	private async sendAIMessage({
		threadId,
		userText,
	}: {
		threadId: string;
		userText: string;
	}) {
		const response = await this.sendAIConversationMessage.execute({
			threadId,
			userText,
		});

		aiLog.info(
			`Number of actions to apply: ${response.actions.length}`,
		);

		for (const action of response.actions) {
			if (!action.type) {
				aiLog.warn(
					`Skipping action with missing type: ${JSON.stringify(
						action,
					)}`,
				);
			}
		}

		return response;
	}

	async sendMessageAndApplyActions({
		threadId,
		userText,
	}: {
		threadId: string;
		userText: string;
	}) {
		await this.sendAIMessage({
			threadId,
			userText,
		});

		await this.processPendingAIActions(threadId);
	}

	async processPendingAIActions(threadId: string) {
		const actions = await this.aiConversationRepo.getPendingActions(
			threadId,
		);

		for (const action of actions) {
			if (!action.type) {
				aiLog.warn(
					`Skipping persisted action with missing type: ${JSON.stringify(
						action,
					)}`,
				);
				continue;
			}

			await this.applyAIAction({
				threadId,
				action: {
					...action,
					type: action.type,
					actionType: action.actionType || action.type,
					payload: normalizeAIActionPayload(
						action.payload as Record<string, unknown>,
					),
				},
			});
		}
	}
}
