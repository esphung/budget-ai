import { ChatResponse } from '@services/OpenAiService';

export function parseChatResponse(rawResponse: ChatResponse): string {
	try {
		return rawResponse.data.text.content;
	} catch (error) {
		console.error('Error parsing assistant response:', error);
		return 'Sorry, I had trouble understanding that.';
	}
}
