import { AIConversationRepository } from '@repositories/AIConversationRepository';
import { ErrorTools } from '@utils/ErrorTools';
import { chatLog } from '@utils/logUtils';
import { AIAction } from './types';

export const handleActionError = async (
	repo: AIConversationRepository,
	input: { threadId: string; action: AIAction },
	error: any,
) => {
	chatLog.error('Error applying action:', {
		actionId: input.action.id,
		error: ErrorTools.extractErrorMessage(error),
	});
	await repo.markActionApplied({
		actionId: input.action.id,
		result: {
			error: ErrorTools.extractErrorMessage(error),
		},
	});
	await repo.saveMessage({
		threadId: input.threadId,
		role: 'tool',
		messageType: 'action_result',
		content: `Error applying action ${
			input.action.actionType
		}: ${ErrorTools.extractErrorMessage(error)}`,
		metadata: {
			action_type: input.action.actionType,
			error: ErrorTools.extractErrorMessage(error),
		},
	});
};
