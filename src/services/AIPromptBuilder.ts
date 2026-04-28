type AIProcedureName = 'launch_greeting' | 'logout' | 'navigate';

const AI_PROCEDURES: Record<AIProcedureName, string> = {
	launch_greeting: `
    Say a short, friendly greeting to the user.
    Do not mention finances unless there is useful context.
    Keep it under 12 words.
    Make it different each time, and use the user's name if provided.
    Vary the wording so it does not feel repetitive.
	`,
	logout: `
	Log the user out of the app.
	- Immediately end the session and do not say anything about finances.
	- Do not say "logging out..." or anything about logging out. Just end the session.
	- If the user does not ask to log out or sign out, do not include a logout action.
	- Do not include a logout action if the user is just asking about logging out but does not explicitly ask to log out or sign out.
	- Do not fill other fields in the payload. Just return an empty object for the payload with a logout action type.
  `,
	navigate: `
	Navigate the user to a different screen in the app.
- If the user asks to go to a specific screen, navigate there.
- If the user asks to go somewhere but does not specify where, navigate to the most relevant screen based on the context.
- If the user does not ask to go anywhere specific, do not include a navigate action.
  `,
};

export class AIPromptBuilder {
	private buildPromptForProcedure(
		procedure: AIProcedureName,
		context: Record<string, unknown> = {},
	) {
		const formattedContext = Object.keys(context).length
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
			procedure,
		};
	}

	launchGreetingPrompt(username: string) {
		return this.buildPromptForProcedure('launch_greeting', {
			username,
		});
	}

	logoutPrompt() {
		return this.buildPromptForProcedure('logout');
	}

	navigatePrompt(destination?: string) {
		return this.buildPromptForProcedure('navigate', {
			destination,
		});
	}

	saveTransactionPrompt(transactionDetails: Record<string, unknown>) {
		return this.buildPromptForProcedure('logout', {
			transactionDetails,
			// Include any other relevant context for saving a transaction here
		});
	}

	genericPrompt(context: Record<string, unknown> = {}) {
		return {
			instructions: `
		You are the AI assistant inside a budgeting app.
			
		App rules:
		- Be concise.
		- Be warm and natural.
		- Do not invent financial data.
		- Use only the provided context.
		- If context is missing, give a generic helpful response.${
			Object.keys(context).length
				? `\nContext:\n${JSON.stringify(context, null, 2)}`
				: ''
		}
	  `.trim(),
			context,
			procedure: 'generic',
			// You could also include a field for expected actions here if you want to guide the AI on what actions to return based on the context
			expectedActions: [], // e.g. ['save_transaction', 'navigate', 'logout']

			// Or you could include more specific instructions in the context for what actions to return based on the user's input
			// For example, if the context includes a user message that describes an expense, you could include instructions to return a save_transaction action with the relevant details in the payload
			// expectedActions: context.userMessage && context.userMessage.includes('spent') ? ['save_transaction'] : [],
		};
	}
} // end of AIPromptBuilder class
