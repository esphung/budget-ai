import { ChatPromptBuilder } from './ChatPromptBuilder';

describe('ChatPromptBuilder', () => {
	let chatPromptBuilder: ChatPromptBuilder;

	beforeEach(() => {
		chatPromptBuilder = new ChatPromptBuilder();
	});

	it('should generate a launch greeting prompt with the provided username', () => {
		const username = 'Eric';
		const prompt = chatPromptBuilder.launchGreetingPrompt(username);

		expect(prompt.instructions).toContain(
			'You are the AI assistant inside a budgeting app.',
		);
		expect(prompt.instructions).toContain(
			'Say a short, friendly greeting to the user.',
		);
		expect(prompt.instructions).toContain(username);
	});

	it('should generate a generic launch greeting prompt if no username is provided', () => {
		const prompt = chatPromptBuilder.launchGreetingPrompt('');

		expect(prompt.instructions).toContain(
			'You are the AI assistant inside a budgeting app.',
		);
		expect(prompt.instructions).toContain(
			'Say a short, friendly greeting to the user.',
		);
		expect(prompt.instructions).not.toContain('undefined');
	});
});
