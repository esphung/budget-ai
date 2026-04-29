export type TransactionType = 'expense' | 'income' | 'transfer';

export type Transaction = {
	id: string;
	accountId: string | null;
	amount: number;
	merchant: string | null;
	category: string | null;
	transactionType: TransactionType;
	date: string;
	createdAt: string;
};

export type NewTransactionInput = {
	accountId?: string | null;
	amount: number;
	merchant?: string | null;
	category?: string | null;
	transactionType: TransactionType;
	date?: string;
};
