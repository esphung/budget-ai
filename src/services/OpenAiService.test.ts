import { ApiClient } from '@services/ApiClient';
import { OpenAiService } from '@services/OpenAiService';
import { parseChatResponse } from '@utils/chatFunctions';

jest.mock('./ApiClient');

describe('OpenAiService', () => {
	let apiClient: jest.Mocked<ApiClient>;
	let openAiService: OpenAiService;

	beforeEach(() => {
		apiClient = new ApiClient(
			'http://localhost:3001',
		) as jest.Mocked<ApiClient>;
		Object.defineProperty(apiClient, 'openai', {
			value: {
				generateText: jest
					.fn()
					.mockImplementation(async (_content: string) => ({
						data: { text: { content: 'Mocked response' } },
					})),
			},
		});

		openAiService = new OpenAiService(apiClient);
	});

	it('should parse chat response correctly', () => {
		const response = { data: { text: { content: 'Hello, Eric!' } } };
		const result = parseChatResponse(response);
		expect(result).toBe('Hello, Eric!');
	});

	it('should send the correct prompt and return the response', async () => {
		const mockResponse = {
			data: { text: { content: 'Hello, Eric!' } },
		};
		jest.spyOn(apiClient.openai, 'generateText').mockResolvedValue(
			mockResponse,
		);

		const response = await openAiService.getLaunchGreeting();

		expect(apiClient.openai.generateText).toHaveBeenCalledWith(
			expect.stringContaining(
				'You are the AI assistant inside a budgeting app.',
			),
		);
		expect(response).toEqual(mockResponse);
	});
});
