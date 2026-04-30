import { TransactionRepository } from '@repositories/TransactionRepository';

export class ClearTransactions {
	constructor(private transactionRepo: TransactionRepository) {}

	execute(): Promise<void> {
		return this.transactionRepo.clearAll();
	}
}
