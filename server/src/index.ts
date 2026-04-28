import cors from 'cors';
import express, { Request, Response } from 'express';
import { jsonErrorHandler } from './middleware/jsonErrorHandler';
import { openAiRouter, plaidRouter, publicRouter } from './routes';
import { env } from './services/env';

const app = express();
const PORT = env.port;

// Allow requests from the RN Metro bundler and local simulators
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
	res.json({ status: 'ok' });
});

// ── Routes will be registered here ───────────────────────────
app.use('/', publicRouter);
app.use('/plaid', plaidRouter);
app.use('/openai', openAiRouter);

app.use(jsonErrorHandler);

app.listen(Number(PORT), () => {
	console.log(`BudgetAI server running on http://localhost:${PORT}`);
});
