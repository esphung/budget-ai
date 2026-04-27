type AIProcedureName = 'launch_greeting';

const AI_PROCEDURES: Record<AIProcedureName, string> = {
	launch_greeting: `
    Say a short, friendly greeting to the user.
    Do not mention finances unless there is useful context.
    Keep it under 12 words.
    Make it different each time, and use the user's name if provided.
    Vary the wording so it does not feel repetitive.
  `,
};

export class ChatPromptBuilder {
	private buildPromptForProcedure(
		procedure: AIProcedureName,
		context?: Record<string, unknown>,
	) {
		const formattedContext = context
			? `\nContext:\n${JSON.stringify(context, null, 2)}`
			: '';

		return {
			instructions: `
        You are the AI assistant inside a budgeting app.

        Follow this named procedure:

        ${AI_PROCEDURES[procedure]}

        App rules:
        - Be concise.
        - Be warm and natural.
        - Do not invent financial data.
        - Use only the provided context.
        - If context is missing, give a generic helpful response.${formattedContext}
      `.trim(),
			context,
		};
	}

	launchGreetingPrompt(username: string) {
		return this.buildPromptForProcedure('launch_greeting', {
			username,
		});
	}
}
