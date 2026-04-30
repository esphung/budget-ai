import { TransactionRepository } from '@repositories/TransactionRepository';
import { Transaction, TransactionType } from 'types/Transaction';

export type CreateManualTransactionInput = {
	amount: string | number;
	merchant?: string;
	category?: string;
	date: string;
	accountId?: string | null;
	transactionType?: TransactionType;
};

export type CreateManualTransactionResult = {
	success: boolean;
	transaction: Transaction | null;
	error: string | null;
};

export class CreateManualTransaction {
	constructor(private transactionRepo: TransactionRepository) {}

	async execute(
		input: CreateManualTransactionInput,
	): Promise<CreateManualTransactionResult> {
		const parsedAmount =
			typeof input.amount === 'number'
				? input.amount
				: Number(input.amount);

		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
			return {
				success: false,
				transaction: null,
				error: 'Enter an amount greater than zero.',
			};
		}

		if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
			return {
				success: false,
				transaction: null,
				error: 'Date must use YYYY-MM-DD.',
			};
		}

		const transactionDate = new Date(`${input.date}T12:00:00.000Z`);
		if (Number.isNaN(transactionDate.getTime())) {
			return {
				success: false,
				transaction: null,
				error: 'Date is invalid.',
			};
		}

		const transaction = await this.transactionRepo.create({
			accountId: input.accountId ?? null,
			amount: parsedAmount,
			merchant: input.merchant,
			category: input.category,
			transactionType: input.transactionType ?? 'expense',
			source: 'manual',
			date: transactionDate.toISOString(),
		});

		return {
			success: true,
			transaction,
			error: null,
		};
	}
}
