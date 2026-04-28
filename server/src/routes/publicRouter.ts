import express, { Request, Response } from 'express';
import { openApiSpec } from '../services/openApiSpec';

const router = express.Router();

interface ApiEndpoint {
	method: string;
	path: string;
	description: string;
	requestBody?: Record<string, unknown>;
	responseExample?: Record<string, unknown>;
}

const apiEndpoints: ApiEndpoint[] = [
	{
		method: 'GET',
		path: '/health',
		description: 'Health check endpoint',
		responseExample: { status: 'ok' },
	},
	{
		method: 'GET',
		path: '/plaid/link-token',
		description: 'Create a Plaid link token for account linking',
		responseExample: {
			linkToken: 'link-sandbox-xxx',
		},
	},
	{
		method: 'POST',
		path: '/plaid/exchange-token',
		description: 'Exchange a public token for an access token',
		requestBody: {
			publicToken: 'string',
			userId: 'string',
		},
		responseExample: {
			accessToken: 'access-sandbox-xxx',
			itemId: 'item-xxx',
		},
	},
	{
		method: 'POST',
		path: '/openai/send-message',
		description: 'Send a message to OpenAI assistant',
		requestBody: {
			messages: [
				{
					role: 'system|user|assistant',
					content: 'string',
				},
			],
		},
		responseExample: {
			content: 'Assistant response text',
			timestamp: '2024-01-01T00:00:00Z',
		},
	},
	{
		method: 'GET',
		path: '/openapi.json',
		description: 'OpenAPI 3.0 specification document',
	},
	{
		method: 'GET',
		path: '/docs',
		description: 'Interactive API documentation (Swagger UI)',
	},
];

function buildServerUrl(req: Request): string {
	const host = req.get('host');
	if (!host) {
		return `http://localhost:${process.env.PORT || 5000}`;
	}

	return `${req.protocol}://${host}`;
}

router.get('/openapi.json', (req: Request, res: Response) => {
	res.json({
		...openApiSpec,
		servers: [
			{ url: buildServerUrl(req), description: 'Current server' },
		],
	});
});

router.get('/docs', (_req: Request, res: Response) => {
	res.type('html').send(`<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>BudgetAI API Docs</title>
		<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
	</head>
	<body>
		<div id="swagger-ui"></div>
		<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
		<script>
			window.onload = () => {
				window.SwaggerUIBundle({
					url: '/openapi.json',
					dom_id: '#swagger-ui',
				});
			};
		</script>
	</body>
</html>`);
});

// ── GET / ────────────────────────────────────────────────────
router.get('/', (req: Request, res: Response) => {
	res.json({
		service: 'BudgetAI API',
		version: '1.0.0',
		description: 'Financial management assistant powered by AI',
		baseUrl: buildServerUrl(req),
		openApiSpec: '/openapi.json',
		docs: '/docs',
		endpoints: apiEndpoints,
	});
});

export default router;
