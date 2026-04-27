export type AssistantResponse = {
	message: string;
	actions?: Array<{
		type: 'save_transaction' | 'update_budget' | 'navigate';
		payload: Record<string, unknown>;
	}>;
};
