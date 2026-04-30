export type AIActionPayload = {
	amount: number;
	merchant: string | null;
	category: string | null;
	date: string | null;
	note: string | null;
	accountId: string | null;
	transactionType: 'expense' | 'income' | 'transfer';
};

export type AIActionStatus = 'pending' | 'applied' | 'rejected' | 'failed';

export type AIAction = {
	type: 'save_transaction' | 'navigate' | 'logout';
	id: string;
	threadId: string;
	messageId: string;
	actionType: string;
	payload: AIActionPayload;
	status: AIActionStatus;
	result?: Record<string, unknown> | null;
	errorMessage?: string | null;
	createdAt: string;
	appliedAt?: string | null;
};

export type CreateTransactionAction = {
	type: 'save_transaction';
	payload: {
		amount: number;
		merchant: string;
		category?: string;
		date?: string;
		note?: string;
	};
};
