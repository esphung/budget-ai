import axios, { AxiosRequestConfig } from 'axios';
import { env } from './env';
import { responseFormat } from './responseFormat';
import type { OpenAI } from 'openai';

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

	async sendAIMessage(messages: { role: string; content: string }[]) {
		try {
			const response = await axios<OpenAI.ChatCompletion>({
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
- if the user asks to go somewhere in the app, include a navigate action with the destination in the payload.
- If the user does not clearly describe an expense, return actions as an empty array.
- Do not say the transaction was saved. Say you can save it or that it is ready to save.
- Use null for missing fields.
          `.trim(),
						},
						...messages.map((message) => ({
							role: message.role,
							content: message.content ?? '',
						})),
					],
					response_format: responseFormat,
				},
			});
			return response.data;
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
