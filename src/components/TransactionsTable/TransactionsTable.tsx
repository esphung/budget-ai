import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import { createStyles } from '@components/TransactionsTable/TransactionsTable.styles';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

export interface TransactionListItem {
	id: string;
	name: string;
	amount: number;
	date: string;
	category: string[];
	transactionType: 'income' | 'expense' | 'transfer';
	merchant: string;
}

interface TransactionsTableProps {
	transactions: TransactionListItem[];
}

export default function TransactionsTable({
	transactions,
}: TransactionsTableProps) {
	const { colors } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.tableContainer}>
			<AppText style={styles.tableTitle}>Transactions</AppText>
			<View style={styles.tableRow}>
				<AppText
					style={[
						styles.tableCell,
						styles.tableHeader,
						styles.tableCellWide,
					]}>
					Name
				</AppText>
				<AppText
					style={[
						styles.tableCell,
						styles.tableHeader,
						{ paddingRight: 20 },
					]}>
					Amount
				</AppText>
				{/* <AppText style={[styles.tableCell, styles.tableHeader]}>
					Date
				</AppText> */}
			</View>
			<ScrollView
				style={styles.rowsScroll}
				contentContainerStyle={styles.rowsScrollContent}
				nestedScrollEnabled
				showsVerticalScrollIndicator={false}>
				{transactions.map((t) => {
					const isIncome =
						t.transactionType != null
							? t.transactionType === 'income'
							: t.amount >= 0;
					const displayAmount = `${
						isIncome ? '+' : '-'
					}$${Math.abs(t.amount).toFixed(2)}`;

					return (
						<View key={t.id} testID={`transaction-row-${t.id}`}>
							<View style={styles.tableRow}>
								<AppText
									style={[
										styles.tableCell,
										styles.tableCellWide,
									]}>
									{t.name}
								</AppText>
								<AppText
									style={[
										styles.tableCell,
										isIncome
											? styles.amountPositive
											: styles.amountNegative,
									]}>
									{displayAmount}
								</AppText>
							</View>
						</View>
					);
				})}
			</ScrollView>
		</View>
	);
}
