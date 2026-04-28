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

export type Message = {
	messageType: 'text' | 'action_request' | 'action_result';
	role: 'user' | 'assistant' | 'tool';
	content: string | null;
	metadata?: Record<string, unknown> | null;
	model?: string | null;
};

export type Thread = {
	id: string;
	createdAt: string;
	updatedAt: string;
};

export type ConversationThread = Thread & {
	messages: AIMessage[];
	actions: AIAction[];
};

export type BudgetTransaction = {
	id: string;
	amount: number;
	category: string;
	date: string;
	description?: string | null;
};

export type AppStackScreen =
	| 'Home'
	| 'Transactions'
	| 'BudgetOverview'
	| 'Settings'
	| 'Login'
	| 'Signup';
