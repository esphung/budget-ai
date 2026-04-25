import express, { Request, Response } from 'express';
import { InsightsController } from '../controllers/insights_controller';
import { type AiTransaction, type AiBalance } from '../services/ai_service';

const router = express.Router();
const controller = new InsightsController();

// ── Runtime shape validators ──────────────────────────────────────────────────

function isValidTransaction(item: unknown): item is AiTransaction {
	if (typeof item !== 'object' || item === null) {
		return false;
	}
	const t = item as Record<string, unknown>;
	return (
		typeof t.transaction_id === 'string' &&
		typeof t.account_id === 'string' &&
		typeof t.name === 'string' &&
		typeof t.amount === 'number' &&
		typeof t.date === 'string' &&
		(t.category === null || Array.isArray(t.category))
	);
}

function isValidBalance(item: unknown): item is AiBalance {
	if (typeof item !== 'object' || item === null) {
		return false;
	}
	const b = item as Record<string, unknown>;
	return (
		typeof b.account_id === 'string' &&
		typeof b.name === 'string' &&
		typeof b.type === 'string' &&
		(b.subtype === null || typeof b.subtype === 'string') &&
		typeof b.balances === 'object' &&
		b.balances !== null
	);
}

/**
 * POST /insights/generate
 *
 * Body: { transactions: AiTransaction[], balances: AiBalance[] }
 *
 * Sends the caller's financial data to the AI service and returns a ranked
 * array of Insight objects.  Raw data never leaves the server — the mobile
 * client only receives the already-processed insights.
 */
router.post('/generate', async (req: Request, res: Response) => {
	const { transactions, balances } = req.body as {
		transactions?: unknown;
		balances?: unknown;
	};

	if (!Array.isArray(transactions) || !Array.isArray(balances)) {
		res.status(400).json({
			error: 'Request body must include "transactions" and "balances" arrays',
		});
		return;
	}

	const invalidTransaction = transactions.find(
		(item) => !isValidTransaction(item),
	);
	if (invalidTransaction !== undefined) {
		res.status(400).json({
			error: 'Each transaction must have transaction_id, account_id, name, amount, date, and category fields',
		});
		return;
	}

	const invalidBalance = balances.find((item) => !isValidBalance(item));
	if (invalidBalance !== undefined) {
		res.status(400).json({
			error: 'Each balance must have account_id, name, type, subtype, and balances fields',
		});
		return;
	}

	try {
		const result = await controller.generate(
			transactions as AiTransaction[],
			balances as AiBalance[],
		);
		res.json(result);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Internal server error';
		// 502 signals a bad gateway / upstream AI failure rather than a client error.
		res.status(502).json({ error: message });
	}
});

export default router;
