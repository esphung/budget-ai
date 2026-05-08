import { TransactionRepository } from '@repositories/TransactionRepository';

export class DeleteTransaction {
	constructor(private transactionRepo: TransactionRepository) {}

	async execute(id: string): Promise<void> {
		await this.transactionRepo.delete(id);
	}
}
