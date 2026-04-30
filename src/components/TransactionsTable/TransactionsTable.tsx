import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import { createStyles } from '@components/TransactionsTable/TransactionsTable.styles';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

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
	onDeleteTransaction?: (transaction: TransactionListItem) => void;
}

export default function TransactionsTable({
	transactions,
	onDeleteTransaction,
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
						styles.amountCell,
					]}>
					Amount
				</AppText>
				{onDeleteTransaction ? (
					<AppText
						style={[
							styles.tableCell,
							styles.tableHeader,
							styles.actionCellLabel,
						]}>
						Action
					</AppText>
				) : null}
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
										styles.amountCell,
										isIncome
											? styles.amountPositive
											: styles.amountNegative,
									]}>
									{displayAmount}
								</AppText>
								{onDeleteTransaction ? (
									<View style={styles.actionCell}>
										<Pressable
											onPress={() => {
												onDeleteTransaction(t);
											}}
											testID={`transaction-delete-${t.id}`}
											style={({ pressed }) => [
												styles.deleteButton,
												pressed &&
													styles.deleteButtonPressed,
											]}>
											<AppText
												style={
													styles.deleteButtonLabel
												}>
												Delete
											</AppText>
										</Pressable>
									</View>
								) : null}
							</View>
						</View>
					);
				})}
			</ScrollView>
		</View>
	);
}
