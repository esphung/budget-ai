import { type Insight } from '@models/Insight';
import { Text, View } from 'react-native';
import styles, {
	severityColors,
	typeEmoji,
} from './InsightsCard.styles';

interface InsightsCardProps {
	insight: Insight;
}

/**
 * Renders a single AI-generated financial insight with colour-coded styling
 * based on severity and a type-specific emoji prefix on the title.
 */
export default function InsightsCard({ insight }: InsightsCardProps) {
	const colors = severityColors[insight.severity];
	const emoji = typeEmoji[insight.type];

	return (
		<View
			testID={`insights-card-${insight.severity}`}
			style={[
				styles.card,
				{
					backgroundColor: colors.background,
					borderColor: colors.border,
				},
			]}>
			<View style={styles.titleRow}>
				<Text style={styles.emoji}>{emoji}</Text>
				<Text style={[styles.title, { color: colors.title }]}>
					{insight.title}
				</Text>
			</View>
			<Text style={styles.body}>{insight.body.trim()}</Text>
		</View>
	);
}
