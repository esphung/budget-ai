export type AccountType =
	| 'cash'
	| 'checking'
	| 'savings'
	| 'credit'
	| 'investment'
	| 'other';

export type Account = {
	id: string;
	ownerId: string | null;
	name: string;
	accountType: AccountType;
	currency: string;
	createdAt: string;
	updatedAt: string;
};

export type NewAccountInput = {
	ownerId?: string | null;
	name: string;
	accountType?: AccountType;
	currency?: string;
};
