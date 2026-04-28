export type AssistantResponse = {
	message: string;
	actions?: Array<{
		type: 'save_transaction' | 'navigate' | 'logout';
		payload: Record<string, unknown>;
	}>;
};
