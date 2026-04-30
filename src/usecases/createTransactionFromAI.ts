// usecases/createTransactionFromAI.ts

import { CategoryRepository } from '@repositories/CategoryRepository';
import { TransactionRepository } from '@repositories/TransactionRepository';
import { generateUniqueId } from '@utils/randomIdUtils';
import { AIAction } from 'types/AIAction';
import { Transaction } from 'types/Transaction';

export type TransactionResult = {
	success: boolean;
	transaction: Transaction | null;
	error: string | null;
};

export class CreateTransactionFromAI {
	constructor(
		private transactionRepo: TransactionRepository,
		private categoryRepo?: CategoryRepository,
	) {}

	async execute(
		action: AIAction,
		rawUserText?: string,
	): Promise<TransactionResult> {
		if (action.type !== 'save_transaction') {
			return {
				success: false,
				transaction: null,
				error: 'Unsupported action type',
			};
		}

		const {
			amount,
			merchant,
			category,
			date,
			accountId = null,
			transactionType = 'expense',
		} = action.payload;

		// Validation (VERY important — don't trust AI blindly)
		if (!amount) {
			return {
				success: false,
				transaction: null,
				error: 'Missing required fields',
			};
		}

		const transaction: Transaction = {
			id: generateUniqueId('txn'),
			amount,
			merchant,
			category: category || null,
			date: date ?? new Date().toISOString(),
			source: 'ai',
			rawUserText: rawUserText?.trim() || undefined,
			syncStatus: 'pending',
			accountId, // AI won't know this, user can assign later
			transactionType, // Default to expense, could be improved with better AI parsing
			createdAt: new Date().toISOString(),
		};

		const savedTransaction = await this.transactionRepo.create(
			transaction,
		);

		if (this.categoryRepo && transaction.category?.trim()) {
			const normalizedCategory = transaction.category.trim();
			const categories = await this.categoryRepo.list();
			const hasCategory = categories.some(
				(existingCategory) =>
					existingCategory.name.toLowerCase() ===
					normalizedCategory.toLowerCase(),
			);

			if (!hasCategory) {
				await this.categoryRepo.create({
					name: normalizedCategory,
				});
			}
		}

		if (!savedTransaction) {
			return {
				success: false,
				error: 'Failed to save transaction to database',
				transaction: null,
			};
		}

		return {
			success: true,
			transaction: savedTransaction,
			error: null,
		};
	}
}
