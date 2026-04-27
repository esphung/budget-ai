// sort in descending order by createdAt
export const sortMessagesByCreatedAt = <T extends { createdAt?: string }>(
	messages: T[],
) => {
	return messages.sort((a, b) => {
		if (!a.createdAt) return 1;
		if (!b.createdAt) return -1;
		return (
			new Date(b.createdAt).getTime() -
			new Date(a.createdAt).getTime()
		);
	});
};
