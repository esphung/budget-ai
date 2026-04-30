import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { CreateTransactionFromAI } from '@usecases/createTransactionFromAI';
import type { AIAction } from 'types/AIAction';

type ExecuteAIActionResult = {
	success: boolean;
	transactionId?: string;
	error?: string;
};

export class ExecuteAIAction {
	constructor(
		private aiConversationRepo: AIConversationRepository,
		private createTransaction: CreateTransactionFromAI,
	) {}

	async execute(
		action: AIAction,
		rawUserText?: string,
	): Promise<ExecuteAIActionResult> {
		const actionType = action.type || action.actionType;

		switch (actionType) {
			case 'save_transaction': {
				const result = await this.createTransaction.execute(
					action,
					rawUserText,
				);

				const { transaction, success } = result;

				if (!success || !transaction) {
					return {
						success: false,
						error: result.error ?? 'Unknown error',
					};
				}

				await this.aiConversationRepo.markActionApplied({
					actionId: action.id,
					result: { transaction_id: transaction.id },
				});

				await this.aiConversationRepo.saveMessage({
					threadId: action.threadId,
					role: 'tool',
					messageType: 'action_result',
					content: 'Transaction saved.',
					metadata: {
						action_type: 'save_transaction',
						transaction_id: transaction.id,
					},
				});

				return {
					success: true,
					transactionId: transaction.id,
				};
			}

			default:
				return {
					success: false,
					error: 'Unknown action type',
				};
		}
	}
}
