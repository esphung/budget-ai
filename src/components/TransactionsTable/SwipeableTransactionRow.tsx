import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import { formatIntlCurrencyDisplay } from '@utils/moneyUtils';
import { useMemo, useRef } from 'react';
import {
	Animated,
	PanResponder,
	Pressable,
	StyleSheet,
	View,
} from 'react-native';
import { AppColors, radius } from '@theme/tokens';
import { TransactionListItem } from './TransactionsTable';

const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = ACTION_WIDTH * 0.5;

function formatDate(dateStr: string): string {
	try {
		const d = new Date(dateStr);
		return d.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
		});
	} catch {
		return dateStr;
	}
}

function getCategoryIcon(
	category: string | null,
	transactionType: string,
): string {
	if (transactionType === 'income') return '↑';
	if (!category) return '•';
	const lower = String(category).toLowerCase();
	if (lower.includes('food') || lower.includes('dining')) return '🍽';
	if (lower.includes('transport') || lower.includes('travel'))
		return '🚗';
	if (lower.includes('grocery') || lower.includes('groceries'))
		return '🛒';
	if (lower.includes('entertainment')) return '🎬';
	if (lower.includes('health') || lower.includes('medical')) return '💊';
	if (lower.includes('shopping')) return '🛍';
	if (lower.includes('utility') || lower.includes('utilities'))
		return '💡';
	if (lower.includes('rent') || lower.includes('housing')) return '🏠';
	if (lower.includes('subscription')) return '📱';
	return '💳';
}

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		container: {
			overflow: 'hidden',
			borderTopWidth: 1,
			borderTopColor: colors.neutral.borderLight,
		},
		actionBackground: {
			position: 'absolute',
			right: 0,
			top: 0,
			bottom: 0,
			width: ACTION_WIDTH,
			backgroundColor: colors.error,
			justifyContent: 'center',
			alignItems: 'center',
		},
		actionLabel: {
			color: '#FFFFFF',
			fontWeight: '700',
			fontSize: 13,
		},
		row: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: colors.neutral.surface,
			paddingVertical: 14,
			paddingHorizontal: 16,
			gap: 12,
		},
		iconContainer: {
			width: 40,
			height: 40,
			borderRadius: radius.full ?? 20,
			backgroundColor: colors.neutral.background,
			justifyContent: 'center',
			alignItems: 'center',
			flexShrink: 0,
		},
		iconText: {
			fontSize: 18,
		},
		rowBody: {
			flex: 1,
			gap: 3,
		},
		rowName: {
			fontSize: 15,
			fontWeight: '600',
			color: colors.neutral.text,
		},
		rowMeta: {
			fontSize: 12,
			color: colors.neutral.textSecondary,
		},
		rowRight: {
			alignItems: 'flex-end',
			gap: 4,
		},
		amountText: {
			fontSize: 16,
			fontWeight: '700',
		},
		amountNegative: {
			color: colors.error,
		},
		amountPositive: {
			color: colors.success,
		},
		dateText: {
			fontSize: 11,
			color: colors.neutral.textTertiary,
		},
	});

interface Props {
	transaction: TransactionListItem;
	onDelete?: (transaction: TransactionListItem) => void;
}

export default function SwipeableTransactionRow({
	transaction: t,
	onDelete,
}: Props) {
	const { colors } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const translateX = useRef(new Animated.Value(0)).current;
	const isOpen = useRef(false);
	// Track position at gesture-start and the settled position after each spring
	const startPosition = useRef(0);
	const currentPosition = useRef(0);

	const springTo = (toValue: number) => {
		isOpen.current = toValue !== 0;
		Animated.spring(translateX, {
			toValue,
			useNativeDriver: true,
			friction: 7,
			tension: 40,
		}).start(({ finished }) => {
			if (finished) {
				currentPosition.current = toValue;
			}
		});
	};

	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, gestureState) => {
				return (
					Math.abs(gestureState.dx) > 8 &&
					Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
				);
			},
			onPanResponderGrant: () => {
				translateX.stopAnimation();
				startPosition.current = currentPosition.current;
			},
			onPanResponderMove: (_, gestureState) => {
				const newVal = Math.max(
					-ACTION_WIDTH,
					Math.min(0, startPosition.current + gestureState.dx),
				);
				translateX.setValue(newVal);
			},
			onPanResponderRelease: (_, gestureState) => {
				const projected = startPosition.current + gestureState.dx;
				springTo(projected < -SWIPE_THRESHOLD ? -ACTION_WIDTH : 0);
			},
		}),
	).current;

	const closeRow = () => springTo(0);

	const sign = t.transactionType === 'income' ? '+' : '-';
	const displayAmount =
		sign + formatIntlCurrencyDisplay(Math.abs(t.amount));
	const icon = getCategoryIcon(t.category, t.transactionType);
	const meta = [t.category, t.source === 'ai' ? 'AI' : 'Manual']
		.filter(Boolean)
		.join(' · ');

	return (
		<View style={styles.container} testID={`transaction-row-${t.id}`}>
			<View style={styles.actionBackground}>
				<Pressable
					onPress={() => {
						closeRow();
						onDelete?.(t);
					}}
					testID={`transaction-delete-${t.id}`}
					style={{ paddingHorizontal: 12, paddingVertical: 16 }}>
					<AppText style={styles.actionLabel}>Delete</AppText>
				</Pressable>
			</View>
			<Animated.View
				style={[styles.row, { transform: [{ translateX }] }]}
				{...panResponder.panHandlers}>
				<View style={styles.iconContainer}>
					<AppText style={styles.iconText}>{icon}</AppText>
				</View>
				<View style={styles.rowBody}>
					<AppText style={styles.rowName} numberOfLines={1}>
						{t.name || t.merchant || 'Unnamed'}
					</AppText>
					{meta ? (
						<AppText style={styles.rowMeta} numberOfLines={1}>
							{meta}
						</AppText>
					) : null}
				</View>
				<View style={styles.rowRight}>
					<AppText
						style={[
							styles.amountText,
							t.transactionType === 'income'
								? styles.amountPositive
								: styles.amountNegative,
						]}>
						{displayAmount}
					</AppText>
					<AppText style={styles.dateText}>
						{formatDate(t.date)}
					</AppText>
				</View>
			</Animated.View>
		</View>
	);
}
