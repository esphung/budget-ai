const mockPlaid = {
	__esModule: true,
	create: jest.fn(),
	open: jest.fn(),
	LinkErrorCode: {
		ACCOUNTS_LIMIT: 'ACCOUNTS_LIMIT',
	},
	LinkErrorType: {
		API_ERROR: 'API_ERROR',
		INVALID_REQUEST: 'INVALID_REQUEST',
	},
	EmbeddedLinkView: () => null,
};

// @ts-ignore
export = mockPlaid;
