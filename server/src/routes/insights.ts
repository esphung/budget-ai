import express, { Request, Response } from 'express';
import { InsightsController } from '../controllers/insights_controller';

const router = express.Router();
const controller = new InsightsController();

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

	try {
		const result = await controller.generate(
			transactions as Parameters<typeof controller.generate>[0],
			balances as Parameters<typeof controller.generate>[1],
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
