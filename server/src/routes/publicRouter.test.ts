import request from 'supertest';
import express, { Application } from 'express';
import publicRouter from './publicRouter';

describe('Public Router', () => {
	let app: Application;

	beforeEach(() => {
		app = express();
		app.use(express.json());
		app.use('/', publicRouter);
	});

	describe('GET /', () => {
		it('should return API documentation', async () => {
			const response = await request(app).get('/');

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty('service', 'BudgetAI API');
			expect(response.body).toHaveProperty('version');
			expect(response.body).toHaveProperty('description');
			expect(response.body).toHaveProperty('baseUrl');
			expect(response.body).toHaveProperty('endpoints');
		});

		it('should return a valid endpoints array', async () => {
			const response = await request(app).get('/');

			expect(Array.isArray(response.body.endpoints)).toBe(true);
			expect(response.body.endpoints.length).toBeGreaterThan(0);
		});

		it('should include all required endpoints', async () => {
			const response = await request(app).get('/');
			const endpoints = response.body.endpoints;

			const paths = endpoints.map((e: { path: string }) => e.path);

			expect(paths).toContain('/health');
			expect(paths).toContain('/plaid/link-token');
			expect(paths).toContain('/plaid/exchange-token');
			expect(paths).toContain('/openai/send-message');
			expect(paths).toContain('/openapi.json');
			expect(paths).toContain('/docs');
		});

		it('should have proper endpoint structure', async () => {
			const response = await request(app).get('/');
			const endpoints = response.body.endpoints;

			endpoints.forEach((endpoint: Record<string, unknown>) => {
				expect(endpoint).toHaveProperty('method');
				expect(endpoint).toHaveProperty('path');
				expect(endpoint).toHaveProperty('description');
				expect(typeof endpoint.method).toBe('string');
				expect(typeof endpoint.path).toBe('string');
				expect(typeof endpoint.description).toBe('string');
			});
		});

		it('should have valid HTTP methods', async () => {
			const response = await request(app).get('/');
			const endpoints = response.body.endpoints;
			const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

			endpoints.forEach((endpoint: { method: string }) => {
				expect(validMethods).toContain(endpoint.method);
			});
		});

		it('should include request and response examples where applicable', async () => {
			const response = await request(app).get('/');
			const postEndpoints = response.body.endpoints.filter(
				(e: { method: string }) => e.method === 'POST',
			);

			postEndpoints.forEach((endpoint: Record<string, unknown>) => {
				expect(endpoint).toHaveProperty('requestBody');
				expect(endpoint).toHaveProperty('responseExample');
			});
		});

		it('should have correct Content-Type header', async () => {
			const response = await request(app).get('/');

			expect(response.type).toMatch(/json/);
		});

		it('should be accessible without authentication', async () => {
			const response = await request(app).get('/');

			expect(response.status).toBe(200);
		});

		it('should include OpenAPI and docs links in root payload', async () => {
			const response = await request(app).get('/');

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty(
				'openApiSpec',
				'/openapi.json',
			);
			expect(response.body).toHaveProperty('docs', '/docs');
		});
	});

	describe('GET /openapi.json', () => {
		it('returns a valid OpenAPI document', async () => {
			const response = await request(app).get('/openapi.json');

			expect(response.status).toBe(200);
			expect(response.type).toMatch(/json/);
			expect(response.body).toHaveProperty('openapi', '3.0.3');
			expect(response.body).toHaveProperty(
				'info.title',
				'BudgetAI API',
			);
			expect(response.body).toHaveProperty('paths./health.get');
			expect(response.body).toHaveProperty(
				'paths./openai/send-message.post',
			);
		});
	});

	describe('GET /docs', () => {
		it('serves swagger UI html', async () => {
			const response = await request(app).get('/docs');

			expect(response.status).toBe(200);
			expect(response.type).toMatch(/html/);
			expect(response.text).toContain('swagger-ui');
			expect(response.text).toContain('/openapi.json');
		});
	});
});
