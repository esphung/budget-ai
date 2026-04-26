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
}

export const openAiService = OpenAiService.getInstance(
	env.openAi.apiKey,
	env.openAi.baseUrl,
);
