export type AccountType =
	| 'cash'
	| 'checking'
	| 'savings'
	| 'credit'
	| 'investment'
	| 'other';

export type Account = {
	id: string;
	name: string;
	accountType: AccountType;
	currency: string;
	createdAt: string;
	updatedAt: string;
};

export type NewAccountInput = {
	name: string;
	accountType?: AccountType;
	currency?: string;
};
