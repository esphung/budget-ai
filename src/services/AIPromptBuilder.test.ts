import { AIPromptBuilder } from '@services/AIPromptBuilder';

describe('AIPromptBuilder', () => {
	let aiPromptBuilder: AIPromptBuilder;

	beforeEach(() => {
		aiPromptBuilder = new AIPromptBuilder();
	});

	it('should generate a launch greeting prompt with the provided username', () => {
		const username = 'Eric';
		const prompt = aiPromptBuilder.launchGreetingPrompt(username);

		expect(prompt.instructions).toContain(
			'You are the AI assistant inside a budgeting app.',
		);
		expect(prompt.instructions).toContain(
			'Say a short, friendly greeting to the user.',
		);
		expect(prompt.instructions).toContain(username);
	});

	it('should generate a generic launch greeting prompt if no username is provided', () => {
		const prompt = aiPromptBuilder.launchGreetingPrompt('');

		expect(prompt.instructions).toContain(
			'You are the AI assistant inside a budgeting app.',
		);
		expect(prompt.instructions).toContain(
			'Say a short, friendly greeting to the user.',
		);
		expect(prompt.instructions).not.toContain('undefined');
	});
});
