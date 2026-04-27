import { ApiClient } from './ApiClient';
import { ChatPromptBuilder } from './ChatPromptBuilder';

type ChatResponse = { data: { text: { content: string } } };

export class OpenAiService {
	private chatPromptBuilder: ChatPromptBuilder;

	constructor(private apiClient: ApiClient) {
		this.chatPromptBuilder = new ChatPromptBuilder();
	}

	// utility method to extract text content from the API response
	parseChatResponse(response: ChatResponse): string {
		return response.data.text.content;
	}

	async getLaunchGreeting(): Promise<ChatResponse> {
		const prompt = this.chatPromptBuilder.launchGreetingPrompt('Eric');
		console.log('[OpenAiService] Sending prompt:', prompt);

		const response = await this.apiClient.openai.generateText(
			prompt.instructions,
		);
		console.log('[OpenAiService] Received response:', response);

		return response;
	}
}
