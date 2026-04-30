import type { AIActionPayload } from 'types/AIAction';

const readString = (value: unknown): string | null => {
	if (value == null) {
		return null;
	}

	const normalized = String(value).trim();
	return normalized ? normalized : null;
};

export const normalizeAIActionPayload = (
	payload: Record<string, unknown>,
): AIActionPayload => {
	const transactionType =
		payload.transactionType ?? payload.transaction_type;

	return {
		merchant: readString(payload.merchant),
		amount:
			typeof payload.amount === 'number'
				? payload.amount
				: Number(payload.amount ?? 0),
		category: readString(payload.category),
		date: readString(payload.date),
		note: readString(payload.note),
		accountId: readString(payload.accountId),
		transactionType:
			transactionType === 'income'
				? 'income'
				: transactionType === 'transfer'
				? 'transfer'
				: 'expense',
	};
};
