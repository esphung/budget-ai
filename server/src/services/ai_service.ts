import { env } from './env';
import { type Insight } from '../types/insight';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AiTransaction {
	transaction_id: string;
	account_id: string;
	name: string;
	amount: number;
	date: string;
	category: string[] | null;
}

export interface AiBalance {
	account_id: string;
	name: string;
	type: string;
	subtype: string | null;
	balances: {
		current: number | null;
		available: number | null;
	};
}

// ── Constants ─────────────────────────────────────────────────────────────────

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';
const MAX_INSIGHTS = 5;
const TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `You are a personal finance advisor analyzing real banking data. \
Generate concise, actionable financial insights based solely on the transaction and balance data provided. \
Do not hallucinate or reference any information not in the data. \
Respond with a JSON object containing an "insights" array of up to ${MAX_INSIGHTS} Insight objects. \
Each Insight must have these exact fields:
  - id: unique string (e.g. "insight_1")
  - type: one of "spending" | "saving" | "income" | "recurring" | "alert"
  - title: short headline (max 10 words)
  - body: 1–3 sentence explanation grounded in the data
  - severity: one of "info" | "warning" | "positive"
  - generatedAt: current ISO 8601 timestamp
Return the most impactful insights first.`;

// ── OpenAI response shape ─────────────────────────────────────────────────────

interface OpenAiResponse {
	choices: Array<{
		message: {
			content: string;
		};
	}>;
}

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * Calls the OpenAI chat-completions API with a structured prompt built from
 * the user's real Plaid transaction and balance data, then parses and returns
 * the resulting Insight array.
 *
 * Keeping the provider call here (rather than in the controller) makes it
 * straightforward to swap OpenAI for a different LLM provider in the future.
 */
export async function generateInsights(
	transactions: AiTransaction[],
	balances: AiBalance[],
): Promise<Insight[]> {
	if (transactions.length === 0 && balances.length === 0) {
		return [];
	}

	const userMessage = JSON.stringify({ transactions, balances });

	const response = await fetch(OPENAI_API_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.openai.apiKey}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: MODEL,
			response_format: { type: 'json_object' },
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: userMessage },
			],
			max_tokens: 1500,
		}),
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});

	if (!response.ok) {
		throw new Error(
			`AI provider error: ${response.status} ${response.statusText}`,
		);
	}

	const result = (await response.json()) as OpenAiResponse;
	const content = result.choices[0]?.message?.content;

	if (!content) {
		throw new Error('No content returned from AI provider');
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(content);
	} catch {
		throw new Error('AI provider returned malformed JSON');
	}

	if (
		typeof parsed !== 'object' ||
		parsed === null ||
		!Array.isArray((parsed as Record<string, unknown>).insights)
	) {
		throw new Error(
			'AI provider response missing expected "insights" array',
		);
	}

	return (parsed as { insights: Insight[] }).insights;
}
