export type Category = {
	id: string;
	ownerId: string | null;
	name: string;
	color: string | null;
	icon: string | null;
	createdAt: string;
	updatedAt: string;
};

export type NewCategoryInput = {
	ownerId?: string | null;
	name: string;
	color?: string | null;
	icon?: string | null;
};
