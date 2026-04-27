import express, { Request, Response } from 'express';
import { openAiService } from '../services/openAiService';

const router = express.Router();

type GenericResponse = {
	data: { text: string } | null;
	status: number;
	errorMessage?: string;
};

export type Action = {
	type: 'save_transaction' | 'update_budget' | 'navigate';
	payload: Record<string, unknown>;
};

type Message = {
	role: string;
	content: string;
};

router.post('/generate-text', async (req: Request, res: Response) => {
	const { content, max_completion_tokens } = req.body;
	if (!content) {
		res.status(400).json({
			errorMessage: 'Missing content in request body',
		});
		return;
	}

	try {
		const result = await openAiService.generateText({
			content,
			max_completion_tokens,
		});
		const response: GenericResponse = {
			data: { text: result },
			status: 200,
		};
		res.json(response);
	} catch (error) {
		res.status(500).json({
			errorMessage: 'Failed to generate text',
			errorDetails:
				error instanceof Error ? error.message : String(error),
		});
	}
});

router.post('/send-message', async (req: Request, res: Response) => {
	const { messages } = req.body as { messages: Message[] };
	try {
		const result = await openAiService.sendAIMessage(messages);

		res.status(200).json({
			data: {
				message: result.content,
				actions: [], // You would extract actions from the result if present
			},
		});
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
