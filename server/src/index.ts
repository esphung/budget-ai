import cors from 'cors';
import express, { ErrorRequestHandler, Request, Response } from 'express';
import { openAiRouter, plaidRouter } from './routes';
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
app.use('/plaid', plaidRouter);
app.use('/openai', openAiRouter);

const jsonErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
	if (
		err instanceof SyntaxError &&
		'body' in err &&
		err.message.toLowerCase().includes('json')
	) {
		res.status(400).json({
			errorMessage: 'Malformed JSON body',
			errorDetails:
				'Request body must be valid JSON. Example: { "messages": [{ "role": "system", "content": "Say hello" }] }',
			data: null,
			status: 400,
		});
		return;
	}

	next(err);
};

app.use(jsonErrorHandler);

app.listen(Number(PORT), () => {
	console.log(`BudgetAI server running on http://localhost:${PORT}`);
});
