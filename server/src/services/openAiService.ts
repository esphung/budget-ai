import axios, { AxiosRequestConfig } from 'axios';
import { env } from './env';

class OpenAiService {
	private static instance: OpenAiService;
	private apiKey: string;
	private config: AxiosRequestConfig;

	private constructor(apiKey: string, baseUrl: string) {
		this.apiKey = apiKey;
		this.config = {
			baseURL: baseUrl,
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.apiKey}`,
			},
		};
	}

	static getInstance(apiKey: string, baseUrl: string): OpenAiService {
		if (!OpenAiService.instance) {
			OpenAiService.instance = new OpenAiService(apiKey, baseUrl);
		}
		return OpenAiService.instance;
	}

	async generateText({
		content,
		max_completion_tokens,
	}: {
		content: string;
		max_completion_tokens?: number;
	}) {
		try {
			const response = await axios({
				...this.config,
				method: 'POST',
				url: '/chat/completions',
				data: {
					model: env.openAi.model,
					messages: [{ role: 'user', content }],
					max_tokens: max_completion_tokens ?? 50,
				},
			});
			return response.data.choices[0].message;
		} catch (error: any) {
			console.error(
				'Error generating text:',
				error.response?.data ?? error.message,
			);
			throw error;
		}
	}

	async sendAIMessage(messages: { role: string; content: string }[]) {
		try {
			const response = await axios({
				...this.config,
				method: 'POST',
				url: '/chat/completions',
				data: {
					model: env.openAi.model,
					messages: [
						{
							role: 'system',
							content: `
You are a helpful budgeting assistant.

You must return JSON that matches the requested schema.

Rules:
- Return a short friendly message.
- If the user clearly describes an expense, include a save_transaction action.
- If the user does not clearly describe an expense, return actions as an empty array.
- Do not say the transaction was saved. Say you can save it or that it is ready to save.
- Use null for missing fields.
- Today's date is 2026-04-27.
          `.trim(),
						},
						...messages.map((message) => ({
							role: message.role,
							content: message.content ?? '',
						})),
					],
					response_format: {
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
													enum: [
														'save_transaction',
													],
												},
												payload: {
													type: 'object',
													additionalProperties:
														false,
													properties: {
														amount: {
															type: [
																'number',
																'null',
															],
														},
														merchant: {
															type: [
																'string',
																'null',
															],
														},
														category: {
															type: [
																'string',
																'null',
															],
														},
														date: {
															type: [
																'string',
																'null',
															],
														},
													},
													required: [
														'amount',
														'merchant',
														'category',
														'date',
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
					},
				},
			});
			return response.data.choices[0].message;
		} catch (error: any) {
			console.error(
				'Error sending AI message:',
				error.response?.data ?? error.message,
			);
			throw error;
		}
	}
}

export const openAiService = OpenAiService.getInstance(
	env.openAi.apiKey,
	env.openAi.baseUrl,
);
