import express, { Request, Response } from 'express';
import { openAiService } from '../services/openAiService';

const router = express.Router();

type GenericResponse = {
	data: { text: string } | null;
	status: number;
	errorMessage?: string;
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

export default router;
