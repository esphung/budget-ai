export type Action = {
	type: 'save_transaction' | 'navigate' | 'logout';
	payload: Record<string, unknown>;
};

export type OpenAIAssistantResponse = {
	message: string;
	actions: Action[];
};
