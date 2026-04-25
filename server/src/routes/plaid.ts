import express, { Request, Response } from 'express';
import { PlaidController } from '../controllers/plaid_controller';

const router = express.Router();
const controller = new PlaidController();

router.get('/link-token', async (_req: Request, res: Response) => {
	try {
		const result = await controller.createLinkToken();
		res.json(result);
	} catch (error: any) {
		res.status(500).json({
			error: error.message ?? 'Internal server error',
		});
	}
});

router.post('/exchange-token', async (req: Request, res: Response) => {
	const { publicToken } = req.body;
	if (!publicToken) {
		res.status(400).json({
			error: 'Missing publicToken in request body',
		});
		return;
	}

	try {
		const result = await controller.exchangePublicToken(publicToken);
		res.json(result);
	} catch (error: any) {
		res.status(500).json({
			error: error.message ?? 'Internal server error',
		});
	}
});

export default router;
