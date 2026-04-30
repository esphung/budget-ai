import { AIMessage } from '@db/types';

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

type Response = {
	message: string;
	actions?: Array<{
		type: 'save_transaction';
		payload: Record<string, unknown>;
	}>;
};

export const parseAssistantResponse = (response: { data: Response }) => {
	const assistantResponse = JSON.parse(response.data.message);
	return assistantResponse;
};
