export type TransactionType = 'expense' | 'income' | 'transfer';

export type Transaction = {
	id: string;
	ownerId: string | null;
	accountId: string | null;
	amount: number;
	merchant: string | null;
	category: string | null;
	transactionType: TransactionType;
	date: string;
	source: 'ai' | 'manual';
	rawUserText?: string;
	syncStatus?: 'pending' | 'synced';
	createdAt: string;
};

export type NewTransactionInput = {
	ownerId?: string | null;
	accountId?: string | null;
	amount: number;
	merchant?: string | null;
	category?: string | null;
	transactionType: TransactionType;
	date?: string;
	source: 'ai' | 'manual';
	rawUserText?: string;
};
