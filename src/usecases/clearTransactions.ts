import { TransactionRepository } from '@repositories/TransactionRepository';

export class ClearTransactions {
	constructor(private transactionRepo: TransactionRepository) {}

	async execute(): Promise<void> {
		await this.transactionRepo.clearAll();
	}
}
