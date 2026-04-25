import {
	generateInsights,
	type AiTransaction,
	type AiBalance,
} from '../services/ai_service';

export class InsightsController {
	/**
	 * Accepts real Plaid transaction and balance data from the mobile client,
	 * forwards them to the AI service, and returns an array of ranked Insights.
	 */
	async generate(transactions: AiTransaction[], balances: AiBalance[]) {
		const insights = await generateInsights(transactions, balances);
		return { insights };
	}
}
