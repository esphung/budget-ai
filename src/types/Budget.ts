export type Budget = {
	id: string;
	ownerId: string | null;
	name: string;
	amount: number;
	categoryId: string | null;
	periodStart: string;
	periodEnd: string;
	createdAt: string;
	updatedAt: string;
};

export type NewBudgetInput = {
	ownerId?: string | null;
	name: string;
	amount: number;
	categoryId?: string | null;
	periodStart: string;
	periodEnd: string;
};
