import express, { Request, Response } from 'express';
import { openAiService } from '../services/openAiService';
import OpenAI from 'openai';

const router = express.Router();

export type OpenAIChatCompletion = OpenAI.ChatCompletion;

export type Action = {
	type: 'save_transaction' | 'update_budget' | 'navigate';
	payload: Record<string, unknown>;
};

type Message = {
	role: string;
	content: string;
};

router.post('/send-message', async (req: Request, res: Response) => {
	const { messages } = req.body as { messages: Message[] };
	try {
		const result = await openAiService.sendAIMessage(messages);

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
});

export default router;
