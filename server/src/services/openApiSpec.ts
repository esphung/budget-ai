export const openApiSpec = {
	openapi: '3.0.3',
	info: {
		title: 'BudgetAI API',
		version: '1.0.0',
		description: 'Public API for BudgetAI backend services.',
	},
	servers: [
		{ url: 'http://localhost:3001', description: 'Local server' },
	],
	paths: {
		'/health': {
			get: {
				tags: ['System'],
				summary: 'Health check',
				responses: {
					'200': {
						description: 'Server is healthy',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										status: {
											type: 'string',
											example: 'ok',
										},
									},
									required: ['status'],
								},
							},
						},
					},
				},
			},
		},
		'/plaid/link-token': {
			get: {
				tags: ['Plaid'],
				summary: 'Create Plaid link token',
				responses: {
					'200': {
						description: 'Link token created',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									additionalProperties: true,
								},
							},
						},
					},
					'500': {
						description: 'Internal server error',
					},
				},
			},
		},
		'/plaid/exchange-token': {
			post: {
				tags: ['Plaid'],
				summary: 'Exchange Plaid public token',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									publicToken: { type: 'string' },
								},
								required: ['publicToken'],
							},
						},
					},
				},
				responses: {
					'200': {
						description: 'Public token exchanged',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									additionalProperties: true,
								},
							},
						},
					},
					'400': {
						description: 'Missing publicToken',
					},
					'500': {
						description: 'Internal server error',
					},
				},
			},
		},
		'/openai/send-message': {
			post: {
				tags: ['OpenAI'],
				summary: 'Send AI chat messages',
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									messages: {
										type: 'array',
										items: {
											type: 'object',
											properties: {
												role: { type: 'string' },
												content: { type: 'string' },
											},
											required: ['role', 'content'],
										},
									},
								},
								required: ['messages'],
							},
						},
					},
				},
				responses: {
					'200': {
						description: 'Assistant response',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									additionalProperties: true,
								},
							},
						},
					},
					'400': {
						description: 'Invalid request body',
					},
					'500': {
						description: 'Failed to send AI message',
					},
				},
			},
		},
	},
} as const;
