import { BudgetRepository } from '@repositories/BudgetRepository';

export class ClearBudgets {
	constructor(private budgetRepo: BudgetRepository) {}

	execute(): Promise<void> {
		return this.budgetRepo.clearAll();
	}
}
