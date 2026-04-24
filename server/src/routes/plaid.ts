import express, { Request, Response } from 'express';
import { PlaidController } from '../controllers/plaidController';

const plaidRouter = express.Router();
const plaidController = new PlaidController();

plaidRouter.get('/link-token', async (_req: Request, res: Response) => {
	try {
		const result = await plaidController.createLinkToken();
		res.json(result);
	} catch (error: any) {
		res.status(500).json({
			error: error.message ?? 'Internal server error',
		});
	}
});

plaidRouter.post('/exchange-token', async (req: Request, res: Response) => {
	const { publicToken } = req.body;
	if (!publicToken) {
		res.status(400).json({
			error: 'Missing publicToken in request body',
		});
		return;
	}

	try {
		const result = await plaidController.exchangePublicToken(
			publicToken,
		);
		res.json(result);
	} catch (error: any) {
		res.status(500).json({
			error: error.message ?? 'Internal server error',
		});
	}
});

export { plaidRouter };
