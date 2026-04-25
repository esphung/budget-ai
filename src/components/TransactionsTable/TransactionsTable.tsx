import styles from '@components/TransactionsTable/TransactionsTable.styles';
import { Text, View } from 'react-native';

interface Transaction {
	id: string;
	name: string;
	amount: number;
	date: string;
	category: string[];
}

interface TransactionsTableProps {
	transactions: Transaction[];
}

export default function TransactionsTable({
	transactions,
}: TransactionsTableProps) {
	return (
		<View style={styles.tableContainer}>
			<Text style={styles.tableTitle}>Transactions</Text>
			<View style={styles.tableRow}>
				<Text
					style={[
						styles.tableCell,
						styles.tableHeader,
						styles.tableCellWide,
					]}>
					Name
				</Text>
				<Text style={[styles.tableCell, styles.tableHeader]}>
					Amount
				</Text>
				<Text style={[styles.tableCell, styles.tableHeader]}>
					Date
				</Text>
			</View>
			{transactions.map((t) => (
				<View key={t.id} style={styles.tableRow}>
					<Text style={[styles.tableCell, styles.tableCellWide]}>
						{t.name}
					</Text>
					<Text
						style={[
							styles.tableCell,
							t.amount < 0
								? styles.amountNegative
								: styles.amountPositive,
						]}>
						{t.amount < 0
							? `-$${Math.abs(t.amount).toFixed(2)}`
							: `+$${t.amount.toFixed(2)}`}
					</Text>
					<Text style={styles.tableCell}>{t.date}</Text>
				</View>
			))}
		</View>
	);
}
