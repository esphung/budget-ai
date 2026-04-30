export type Category = {
	id: string;
	name: string;
	color: string | null;
	icon: string | null;
	createdAt: string;
	updatedAt: string;
};

export type NewCategoryInput = {
	name: string;
	color?: string | null;
	icon?: string | null;
};
