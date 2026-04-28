export function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function humanReadableDate(
	date: Date,
	monthFormatting: 'long' | 'short' | 'numeric' | 'none' = 'short',
	dayFormatting: 'numeric' | '2-digit' | 'none' = 'numeric',
	yearFormatting: 'numeric' | '2-digit' | 'none' = 'numeric',
): string {
	const options: Intl.DateTimeFormatOptions = {
		month: monthFormatting === 'none' ? undefined : monthFormatting,
		day: dayFormatting === 'none' ? undefined : dayFormatting,
		year: yearFormatting === 'none' ? undefined : yearFormatting,
	};

	return date.toLocaleDateString(undefined, options);
}
