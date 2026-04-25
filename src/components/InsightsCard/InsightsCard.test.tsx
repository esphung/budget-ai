import { render } from '@testing-library/react-native';
import InsightsCard from './InsightsCard';
import { type Insight } from '@models/Insight';

const baseInsight: Omit<Insight, 'severity' | 'type'> = {
	id: 'insight_1',
	title: 'High dining spend',
	body: 'You have been spending more than usual on dining out this month.',
	generatedAt: '2024-04-25T00:00:00Z',
};

describe('InsightsCard', () => {
	it('renders the insight title and body', () => {
		const insight: Insight = {
			...baseInsight,
			type: 'spending',
			severity: 'warning',
		};
		const { getByText } = render(<InsightsCard insight={insight} />);

		expect(getByText('High dining spend')).toBeTruthy();
		expect(
			getByText(
				'You have been spending more than usual on dining out this month.',
			),
		).toBeTruthy();
	});

	it('renders the correct emoji for each insight type', () => {
		const types: Insight['type'][] = [
			'spending',
			'saving',
			'income',
			'recurring',
			'alert',
		];
		const expectedEmojis = ['💸', '💰', '📈', '🔄', '⚠️'];

		types.forEach((type, index) => {
			const insight: Insight = {
				...baseInsight,
				type,
				severity: 'info',
			};
			const { getByText } = render(<InsightsCard insight={insight} />);
			expect(getByText(expectedEmojis[index] as string)).toBeTruthy();
		});
	});

	it('applies different background colors per severity', () => {
		const severities: Insight['severity'][] = [
			'info',
			'warning',
			'positive',
		];
		const expectedColors = ['#e3f2fd', '#fff8e1', '#e8f5e9'];

		severities.forEach((severity, index) => {
			const insight: Insight = {
				...baseInsight,
				type: 'saving',
				severity,
			};
			const { getByTestId } = render(<InsightsCard insight={insight} />);
			const cardEl = getByTestId(`insights-card-${severity}`);
			// The card view carries inline background color via the style array.
			const flatStyle = JSON.stringify(cardEl.props.style);
			expect(flatStyle).toContain(expectedColors[index]);
		});
	});
});
