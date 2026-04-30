export function formatIntlCurrencyDisplay(amount: number): string {
	if (typeof amount !== 'number' || isNaN(amount)) {
		throw new Error(
			'[moneyUtils] Invalid amount provided to formatIntlCurrency',
		);
	}

	const displayAmount = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);

	return displayAmount;
}
