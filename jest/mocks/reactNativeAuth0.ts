class Auth0 {
	webAuth = {
		authorize: jest.fn().mockResolvedValue({
			accessToken: 'mock-access-token',
			idToken: 'mock-id-token',
		}),
		clearSession: jest.fn().mockResolvedValue(undefined),
	};

	credentialsManager = {
		saveCredentials: jest.fn().mockResolvedValue(undefined),
		clearCredentials: jest.fn().mockResolvedValue(undefined),
	};
}

export default Auth0;
