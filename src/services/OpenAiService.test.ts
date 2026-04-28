import { OpenAiService } from './OpenAiService';

const mockSaveMessage = jest.fn();
const mockGetMessages = jest.fn();
const mockSaveAction = jest.fn();
const mockGetPendingActions = jest.fn();

jest.mock('@repositories/AIConversationRepository', () => {
	return {
		AIConversationRepository: jest.fn().mockImplementation(() => ({
			saveMessage: mockSaveMessage,
			getMessages: mockGetMessages,
			saveAction: mockSaveAction,
			getPendingActions: mockGetPendingActions,
		})),
	};
});

describe('OpenAiService assistant mapping', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockSaveMessage.mockResolvedValue('assistant-msg-id');
		mockGetMessages.mockResolvedValue([]);
		mockGetPendingActions.mockResolvedValue([]);
		mockSaveAction.mockResolvedValue('action-id');
	});

	it('stores plain text assistant content as-is when response is not JSON', async () => {
		const sendMessageMock = jest.fn().mockResolvedValue({
			message: 'Plain assistant response',
			actions: [],
		});
		const api = { openai: { sendMessage: sendMessageMock } } as any;
		const db = {} as any;
		const service = new OpenAiService(api, db);

		await service.sendMessageAndApplyActions({
			threadId: 'thread-1',
			userText: 'hello',
		});

		expect(mockSaveMessage).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				role: 'assistant',
				messageType: 'text',
				content: 'Plain assistant response',
			}),
		);
		expect(mockSaveAction).not.toHaveBeenCalled();
	});

	it('stores parsed message and valid actions from JSON assistant payload', async () => {
		const sendMessageMock = jest.fn().mockResolvedValue({
			message: 'Transaction saved',
			actions: [
				{ type: 'save_transaction', payload: { amount: 12.5 } },
			],
		});
		const api = { openai: { sendMessage: sendMessageMock } } as any;
		const db = {} as any;
		// const service = new OpenAiService(api, db);
		const service = new OpenAiService(api, db, () => {});

		await service.sendMessageAndApplyActions({
			threadId: 'thread-2',
			userText: 'save this',
		});

		expect(mockSaveMessage).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({
				role: 'assistant',
				messageType: 'text',
				content: 'Transaction saved',
			}),
		);
		expect(mockSaveMessage).toHaveBeenCalledWith(
			expect.objectContaining({
				messageType: 'action_request',
				metadata: expect.objectContaining({
					action_type: 'save_transaction',
				}),
			}),
		);
		expect(mockSaveAction).toHaveBeenCalledWith(
			expect.objectContaining({
				actionType: 'save_transaction',
				payload: { amount: 12.5 },
			}),
		);
	});

	it('ignores malformed actions shape instead of throwing', async () => {
		const sendMessageMock = jest.fn().mockResolvedValue({
			message: 'ok',
			actions: [],
		});
		const api = { openai: { sendMessage: sendMessageMock } } as any;
		const db = {} as any;
		const service = new OpenAiService(api, db);

		await expect(
			service.sendMessageAndApplyActions({
				threadId: 'thread-3',
				userText: 'test',
			}),
		).resolves.toBeUndefined();

		expect(mockSaveMessage).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ content: 'ok' }),
		);
		expect(mockSaveAction).not.toHaveBeenCalled();
	});
});
