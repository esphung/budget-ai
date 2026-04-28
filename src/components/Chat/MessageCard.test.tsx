import React from 'react';
import { render } from '@testing-library/react-native';
import MessageCard from './MessageCard';
import { AIMessage } from '@db/types';

const baseMessage: AIMessage = {
	id: 'msg_1',
	threadId: 'thrd_1',
	role: 'assistant',
	messageType: 'text',
	content: null,
	metadata: null,
	model: null,
	createdAt: new Date().toISOString(),
};

describe('MessageCard', () => {
	it('renders assistant text content unchanged', () => {
		const item: AIMessage = {
			...baseMessage,
			content:
				'It seems like you did not specify an expense or action. How can I assist you with your budget today?',
		};

		const { getByText } = render(<MessageCard item={item} />);

		expect(
			getByText(
				'It seems like you did not specify an expense or action. How can I assist you with your budget today?',
			),
		).toBeTruthy();
	});

	it('keeps plain assistant text unchanged', () => {
		const item: AIMessage = {
			...baseMessage,
			content: 'Thanks, I saved that expense.',
		};

		const { getByText } = render(<MessageCard item={item} />);
		expect(getByText('Thanks, I saved that expense.')).toBeTruthy();
	});

	it('renders JSON-like assistant strings as plain text', () => {
		const item: AIMessage = {
			...baseMessage,
			content: '{"message":"legacy payload"}',
		};

		const { getByText } = render(<MessageCard item={item} />);
		expect(getByText('{"message":"legacy payload"}')).toBeTruthy();
	});

	it('renders user content unchanged', () => {
		const item: AIMessage = {
			...baseMessage,
			role: 'user',
			content: '{"message":"hello"}',
		};

		const { getByText } = render(<MessageCard item={item} />);
		expect(getByText('{"message":"hello"}')).toBeTruthy();
	});
});
