export const generateUniqueId = (prefix: string = 'id') =>
	`${prefix}_${Date.now().toString(36)}_${Math.random()
		.toString(36)
		.substr(2, 9)}`;
