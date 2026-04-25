import express, { Request, Response } from 'express';
import { PlaidController } from '../controllers/plaid_controller';

const router = express.Router();
const controller = new PlaidController();

router.get('/link-token', async (_req: Request, res: Response) => {
	try {
		const result = await controller.createLinkToken();
		res.json(result);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Internal server error';
		res.status(500).json({ error: message });
	}
});

router.post('/exchange-token', async (req: Request, res: Response) => {
	const { publicToken } = req.body as { publicToken?: string };
	if (!publicToken) {
		res.status(400).json({
			error: 'Missing publicToken in request body',
		});
		return;
	}

	try {
		const result = await controller.exchangePublicToken(publicToken);
		res.json(result);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Internal server error';
		res.status(500).json({ error: message });
	}
});

router.get('/transactions', async (_req: Request, res: Response) => {
	try {
		const transactions = await controller.getTransactions();
		res.json({ transactions });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Internal server error';
		const status = message.includes('No linked account') ? 401 : 500;
		res.status(status).json({ error: message });
	}
});

router.get('/balances', async (_req: Request, res: Response) => {
	try {
		const accounts = await controller.getBalances();
		res.json({ accounts });
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : 'Internal server error';
		const status = message.includes('No linked account') ? 401 : 500;
		res.status(status).json({ error: message });
	}
});

export default router;

