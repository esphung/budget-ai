import AppText from '@components/AppText/AppText';
import { createStyles } from '@components/TransactionsTable/TransactionsTable.styles';
import { useTheme } from '@providers/ThemeProvider';
import { formatIntlCurrencyDisplay } from '@utils/moneyUtils';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Transaction } from 'types/Transaction';

// export interface TransactionListItem {
// 	id: string;
// 	name: string;
// 	amount: number;
// 	transactionType: TransactionType;
// 	date: string;
// 	category: string[];
// 	merchant: string;
// }

export type TransactionListItem = Transaction & {
	category: string[];
	name: string;
};

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
				contentInset={{ bottom: 16 }}
				scrollIndicatorInsets={{ bottom: 16 }}
				automaticallyAdjustContentInsets={false}
				nestedScrollEnabled
				showsVerticalScrollIndicator={false}>
				{transactions.map((t) => {
					const displayAmount = formatIntlCurrencyDisplay(
						Math.abs(t.amount),
					);
					return (
						<View key={t.id} testID={`transaction-row-${t.id}`}>
							<View style={styles.tableRow}>
								<AppText
									style={[
										styles.tableCell,
										styles.tableCellWide,
									]}>
									{t.name || ''}
								</AppText>
								<AppText
									ellipsizeMode="tail"
									numberOfLines={1}
									style={[
										styles.tableCell,
										styles.amountCell,
										t.transactionType === 'income'
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
