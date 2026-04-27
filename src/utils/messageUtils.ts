import { AIMessage } from '@db/types';
import { AssistantResponse } from 'types/AssistantResponse';

// sort in descending order by createdAt
export const sortMessagesByCreatedAt = <T extends { createdAt?: string }>(
	messages: T[],
) => {
	return messages.sort((a, b) => {
		if (!a.createdAt) return 1;
		if (!b.createdAt) return -1;
		return (
			new Date(b.createdAt).getTime() -
			new Date(a.createdAt).getTime()
		);
	});
};

export const mapAIMessageForAI = (message: AIMessage) => ({
	role: message.role === 'tool' ? 'assistant' : message.role,
	content: message.content || '',
});

export const parseAssistantResponse = (response: {
	data: AssistantResponse;
}) => {
	const assistantResponse: AssistantResponse = JSON.parse(
		response.data.message,
	);
	return assistantResponse;
};
