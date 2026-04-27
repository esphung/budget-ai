export type AIMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export type AIMessageType =
	| 'text'
	| 'action_request'
	| 'action_result'
	| 'error'
	| 'summary';

export type AIMessage = {
	id: string;
	threadId: string;
	role: AIMessageRole;
	messageType: AIMessageType;
	content: string | null;
	metadata?: Record<string, unknown> | null;
	model?: string | null;
	createdAt: string;
};

export type AIActionStatus = 'pending' | 'applied' | 'rejected' | 'failed';

export type AIAction = {
	id: string;
	threadId: string;
	messageId: string;
	actionType: string;
	payload: Record<string, unknown>;
	status: AIActionStatus;
	result?: Record<string, unknown> | null;
	errorMessage?: string | null;
	createdAt: string;
	appliedAt?: string | null;
};
