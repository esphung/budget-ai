import AppText from '@components/AppText/AppText';
import SwipeableTransactionRow from '@components/TransactionsTable/SwipeableTransactionRow';
import { createStyles } from '@components/TransactionsTable/TransactionsTable.styles';
import { useTheme } from '@providers/ThemeProvider';
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

export default function TransactionsTable({
	transactions,
	onDeleteTransaction,
}: TransactionsTableProps) {
	const { colors } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.tableContainer}>
			<AppText style={styles.tableTitle}>Transactions</AppText>
			<ScrollView
				style={styles.rowsScroll}
				contentContainerStyle={styles.rowsScrollContent}
				contentInset={{ bottom: 16 }}
				scrollIndicatorInsets={{ bottom: 16 }}
				automaticallyAdjustContentInsets={false}
				nestedScrollEnabled
				showsVerticalScrollIndicator={false}>
				{transactions.map((t) => (
					<SwipeableTransactionRow
						key={t.id}
						transaction={t}
						onDelete={onDeleteTransaction}
					/>
				))}
			</ScrollView>
		</View>
	);
}
