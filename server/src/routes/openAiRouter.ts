import express, { Request, Response } from 'express';
import { openAiService } from '../services/openAiService';
import { OpenAIAssistantResponse } from '../types/openai';

const router = express.Router();

type Message = {
	role: string;
	content: string;
};

function isValidMessageArray(value: unknown): value is Message[] {
	if (!Array.isArray(value)) {
		return false;
	}

	return value.every(
		(item) =>
			typeof item === 'object' &&
			item !== null &&
			typeof item.role === 'string' &&
			typeof item.content === 'string',
	);
}

router.post(
	'/send-message',
	validateMessages,
	async (req: Request, res: Response) => {
		const { messages } = req.body as { messages: Message[] };

		try {
			const result: OpenAIAssistantResponse =
				await openAiService.sendAIMessage(messages);

			res.status(200).json(result);
		} catch (error) {
			res.status(500).json({
				errorMessage: 'Failed to send AI message',
				errorDetails:
					error instanceof Error ? error.message : String(error),
				data: null,
				status: 500,
			});
		}
	},
);

function validateMessages(
	req: Request,
	res: Response,
	next: express.NextFunction,
) {
	const { messages } = req.body as { messages?: unknown };

	if (!isValidMessageArray(messages)) {
		res.status(400).json({
			errorMessage: 'Invalid request body',
			errorDetails:
				'Expected body shape: { "messages": [{ "role": string, "content": string }] }',
			data: null,
			status: 400,
		});
		return;
	}

	next();
}

export default router;
