export type Budget = {
	id: string;
	name: string;
	amount: number;
	categoryId: string | null;
	periodStart: string;
	periodEnd: string;
	createdAt: string;
	updatedAt: string;
};

export type NewBudgetInput = {
	name: string;
	amount: number;
	categoryId?: string | null;
	periodStart: string;
	periodEnd: string;
};
