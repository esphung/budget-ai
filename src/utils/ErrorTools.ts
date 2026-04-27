export class ErrorTools {
	static extractErrorMessage(error: any): string {
		// can be error.response or just error.message
		const message =
			error?.response?.data || error.message || 'Unknown error';
		console.error('Error:', message);
		return message;
	}
}
