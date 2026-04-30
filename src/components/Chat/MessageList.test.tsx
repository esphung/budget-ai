import React from 'react';
import { render } from '@testing-library/react-native';
import MessageList from './MessageList';
import { AIMessage } from '@db/types';

const baseMessage: AIMessage = {
	id: 'msg_1',
	threadId: 'thrd_1',
	role: 'assistant',
	messageType: 'text',
	content: 'hello',
	metadata: null,
	model: null,
	createdAt: '2026-04-30T12:00:00.000Z',
};

describe('MessageList', () => {
	it('groups by transaction date when metadata payload date exists', () => {
		const messages: AIMessage[] = [
			{
				...baseMessage,
				id: 'msg_1',
				createdAt: '2026-04-30T12:00:00.000Z',
				metadata: {
					payload: {
						date: '2026-04-27',
					},
				},
			},
			{
				...baseMessage,
				id: 'msg_2',
				createdAt: '2026-04-30T11:59:00.000Z',
				metadata: {
					payload: {
						date: '2026-04-27',
					},
				},
			},
			{
				...baseMessage,
				id: 'msg_3',
				createdAt: '2026-04-30T11:58:00.000Z',
				metadata: null,
			},
		];

		const { queryAllByTestId } = render(
			<MessageList messages={messages} />,
		);

		expect(queryAllByTestId(/message-day-divider-/i).length).toBe(2);
	});

	it('keeps one divider when all messages are in the same day', () => {
		const messages: AIMessage[] = [
			{
				...baseMessage,
				id: 'msg_1',
				createdAt: '2026-04-30T12:00:00.000Z',
			},
			{
				...baseMessage,
				id: 'msg_2',
				createdAt: '2026-04-30T10:00:00.000Z',
			},
			{
				...baseMessage,
				id: 'msg_3',
				createdAt: '2026-04-30T08:00:00.000Z',
			},
		];

		const { queryAllByTestId } = render(
			<MessageList messages={messages} />,
		);

		expect(queryAllByTestId(/message-day-divider-/i).length).toBe(1);
	});
});
