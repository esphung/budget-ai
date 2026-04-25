export type InsightType =
	| 'spending'
	| 'saving'
	| 'income'
	| 'recurring'
	| 'alert';

export type InsightSeverity = 'info' | 'warning' | 'positive';

export interface Insight {
	id: string;
	type: InsightType;
	title: string;
	body: string;
	severity: InsightSeverity;
	generatedAt: string;
}
