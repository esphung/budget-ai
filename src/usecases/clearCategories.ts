import { CategoryRepository } from '@repositories/CategoryRepository';

export class ClearCategories {
	constructor(private categoryRepo: CategoryRepository) {}

	execute(): Promise<void> {
		return this.categoryRepo.clearAll();
	}
}
