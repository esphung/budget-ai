import AppText from '@components/AppText/AppText';
import SwipeableTransactionRow from '@components/TransactionsTable/SwipeableTransactionRow';
import { createStyles } from '@components/TransactionsTable/TransactionsTable.styles';
import { useTheme } from '@providers/ThemeProvider';
import { formatIntlCurrencyDisplay } from '@utils/moneyUtils';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Transaction } from 'types/Transaction';

export type TransactionListItem = Transaction & {
	name: string;
};

interface TransactionsTableProps {
	transactions: TransactionListItem[];
	onDeleteTransaction?: (transaction: TransactionListItem) => void;
}

type TransactionSection = {
	dayKey: string;
	label: string;
	transactions: TransactionListItem[];
	netAmount: number;
};

const toDateKey = (value: string): string | null => {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}

	return parsed.toISOString().slice(0, 10);
};

const formatSectionLabel = (dayKey: string): string => {
	if (dayKey === 'unknown') {
		return 'Unknown date';
	}

	const parsed = new Date(`${dayKey}T12:00:00.000Z`);
	if (Number.isNaN(parsed.getTime())) {
		return dayKey;
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const compared = new Date(parsed);
	compared.setHours(0, 0, 0, 0);

	const diffDays = Math.round(
		(today.getTime() - compared.getTime()) / 86400000,
	);

	if (diffDays === 0) {
		return 'Today';
	}

	if (diffDays === 1) {
		return 'Yesterday';
	}

	return parsed.toLocaleDateString(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

export default function TransactionsTable({
	transactions,
	onDeleteTransaction,
}: TransactionsTableProps) {
	const { colors } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const sections = useMemo<TransactionSection[]>(() => {
		const mapped = new Map<string, TransactionSection>();
		const orderedKeys: string[] = [];

		for (const transaction of transactions) {
			const dayKey = toDateKey(transaction.date) || 'unknown';

			if (!mapped.has(dayKey)) {
				mapped.set(dayKey, {
					dayKey,
					label: formatSectionLabel(dayKey),
					transactions: [],
					netAmount: 0,
				});
				orderedKeys.push(dayKey);
			}

			const section = mapped.get(dayKey);
			if (!section) {
				continue;
			}

			section.transactions.push(transaction);
			if (transaction.transactionType === 'income') {
				section.netAmount += Math.abs(transaction.amount);
			} else {
				section.netAmount -= Math.abs(transaction.amount);
			}
		}

		return orderedKeys
			.map((key) => mapped.get(key))
			.filter((value): value is TransactionSection => Boolean(value));
	}, [transactions]);

	return (
		<View style={styles.tableContainer}>
			<AppText style={styles.tableTitle}>Transactions</AppText>
			<ScrollView
				style={styles.rowsScroll}
				contentContainerStyle={styles.rowsScrollContent}
				contentInset={{ bottom: 28 }}
				scrollIndicatorInsets={{ bottom: 28 }}
				automaticallyAdjustContentInsets={false}
				nestedScrollEnabled
				showsVerticalScrollIndicator={false}>
				{sections.map((section) => {
					const dailyNetPositive = section.netAmount >= 0;
					const dailyNetLabel = `${
						dailyNetPositive ? '+' : '-'
					}${formatIntlCurrencyDisplay(
						Math.abs(section.netAmount),
					)}`;

					return (
						<View key={`section-${section.dayKey}`}>
							<View
								testID={`transactions-day-header-${section.dayKey}`}
								style={styles.sectionHeader}>
								<View style={styles.sectionHeaderLeft}>
									<AppText
										style={styles.sectionHeaderTitle}>
										{section.label}
									</AppText>
									<AppText
										style={styles.sectionHeaderCount}>
										{section.transactions.length}{' '}
										{section.transactions.length === 1
											? 'entry'
											: 'entries'}
									</AppText>
								</View>
								<View
									style={[
										styles.dailyNetBadge,
										dailyNetPositive
											? styles.dailyNetBadgePositive
											: styles.dailyNetBadgeNegative,
									]}>
									<AppText
										style={[
											styles.dailyNetText,
											dailyNetPositive
												? styles.dailyNetTextPositive
												: styles.dailyNetTextNegative,
										]}>
										{dailyNetLabel}
									</AppText>
								</View>
							</View>
							{section.transactions.map((t) => (
								<SwipeableTransactionRow
									key={t.id}
									transaction={t}
									onDelete={onDeleteTransaction}
								/>
							))}
						</View>
					);
				})}
			</ScrollView>
		</View>
	);
}
