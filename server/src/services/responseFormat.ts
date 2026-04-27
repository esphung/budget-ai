import type OpenAI from 'openai';

export const responseFormat: OpenAI.ResponseFormatJSONSchema = {
	type: 'json_schema',
	json_schema: {
		name: 'budget_ai_response',
		strict: true,
		schema: {
			type: 'object',
			additionalProperties: false,
			properties: {
				message: {
					type: 'string',
				},
				actions: {
					type: 'array',
					items: {
						type: 'object',
						additionalProperties: false,
						properties: {
							type: {
								type: 'string',
								enum: ['save_transaction', 'navigate'],
							},
							payload: {
								type: 'object',
								additionalProperties: false,
								properties: {
									transaction_type: {
										type: ['string', 'null'],
										enum: ['expense', 'income'],
									},
									amount: {
										type: ['number', 'null'],
									},
									merchant: {
										type: ['string', 'null'],
									},
									category: {
										type: ['string', 'null'],
									},
									date: {
										type: ['string', 'null'],
									},
									screen: {
										enum: [
											'HomeScreen',
											'TestScreen',
											'null',
										],
									},
								},
								required: [
									'amount',
									'merchant',
									'category',
									'date',
									'screen',
									'transaction_type',
								],
							},
						},
						required: ['type', 'payload'],
					},
				},
			},
			required: ['message', 'actions'],
		},
	},
};
