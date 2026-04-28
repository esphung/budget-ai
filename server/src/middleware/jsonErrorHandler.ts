import { ErrorRequestHandler } from 'express';

export const jsonErrorHandler: ErrorRequestHandler = (
	err,
	_req,
	res,
	next,
) => {
	if (
		err instanceof SyntaxError &&
		'body' in err &&
		err.message.toLowerCase().includes('json')
	) {
		res.status(400).json({
			errorMessage: 'Malformed JSON body',
			errorDetails:
				'Request body must be valid JSON. Example: { "messages": [{ "role": "system", "content": "Say hello" }] }',
			data: null,
			status: 400,
		});
		return;
	}

	next(err);
};
