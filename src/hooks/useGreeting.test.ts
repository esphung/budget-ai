import { renderHook } from '@testing-library/react-native';
import useGreeting from './useGreeting';
import { OpenAiService } from '@services/OpenAiService';
import { AIMessage } from '@db/types';

const mockSendGreeting = jest.fn().mockResolvedValue(undefined);

const makeAiService = (): OpenAiService =>
	({ sendGreeting: mockSendGreeting } as unknown as OpenAiService);

const makeMessages = (count: number): AIMessage[] =>
	Array.from({ length: count }, (_, i) => ({
		id: `msg_${i}`,
		threadId: 'thread-1',
		role: 'assistant' as const,
		messageType: 'text' as const,
		content: `message ${i}`,
		createdAt: new Date().toISOString(),
	}));

describe('useGreeting', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('does not send a greeting when messages are not loaded yet', () => {
		renderHook(() =>
			useGreeting({
				threadId: 'thread-1',
				messages: [],
				isMessagesLoaded: false,
				aiService: makeAiService(),
			}),
		);

		expect(mockSendGreeting).not.toHaveBeenCalled();
	});

	it('does not send a greeting when threadId is null', () => {
		renderHook(() =>
			useGreeting({
				threadId: null,
				messages: [],
				isMessagesLoaded: true,
				aiService: makeAiService(),
			}),
		);

		expect(mockSendGreeting).not.toHaveBeenCalled();
	});

	it('does not send a greeting when aiService is null', () => {
		renderHook(() =>
			useGreeting({
				threadId: 'thread-1',
				messages: [],
				isMessagesLoaded: true,
				aiService: null,
			}),
		);

		expect(mockSendGreeting).not.toHaveBeenCalled();
	});

	it('always sends a greeting when the thread has no messages', () => {
		renderHook(() =>
			useGreeting({
				threadId: 'thread-1',
				messages: [],
				isMessagesLoaded: true,
				aiService: makeAiService(),
			}),
		);

		expect(mockSendGreeting).toHaveBeenCalledWith({
			threadId: 'thread-1',
		});
	});

	it('sends a greeting when Math.random is below the threshold', () => {
		jest.spyOn(Math, 'random').mockReturnValue(0.1); // below 0.3

		renderHook(() =>
			useGreeting({
				threadId: 'thread-1',
				messages: makeMessages(5),
				isMessagesLoaded: true,
				aiService: makeAiService(),
			}),
		);

		expect(mockSendGreeting).toHaveBeenCalledWith({
			threadId: 'thread-1',
		});

		jest.spyOn(Math, 'random').mockRestore();
	});

	it('does not send a greeting when Math.random is above the threshold', () => {
		jest.spyOn(Math, 'random').mockReturnValue(0.9); // above 0.3

		renderHook(() =>
			useGreeting({
				threadId: 'thread-1',
				messages: makeMessages(5),
				isMessagesLoaded: true,
				aiService: makeAiService(),
			}),
		);

		expect(mockSendGreeting).not.toHaveBeenCalled();

		jest.spyOn(Math, 'random').mockRestore();
	});

	it('sends the greeting only once even if dependencies change', () => {
		const { rerender } = renderHook(
			({ loaded }: { loaded: boolean }) =>
				useGreeting({
					threadId: 'thread-1',
					messages: [],
					isMessagesLoaded: loaded,
					aiService: makeAiService(),
				}),
			{ initialProps: { loaded: false } },
		);

		rerender({ loaded: true });
		rerender({ loaded: true });

		expect(mockSendGreeting).toHaveBeenCalledTimes(1);
	});
});
