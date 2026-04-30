import { TransactionRepository } from '@repositories/TransactionRepository';

export class DeleteTransaction {
	constructor(private transactionRepo: TransactionRepository) {}

	execute(id: string): Promise<void> {
		return this.transactionRepo.delete(id);
	}
}
