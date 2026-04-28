import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import { createStyles } from '@components/TransactionsTable/TransactionsTable.styles';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { humanReadableDate } from '@utils/dateUtil';

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
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const handleRowPress = (id: string) => {
		setExpandedId((prev) => (prev === id ? null : id));
	};

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
					const isExpanded = expandedId === t.id;

					return (
						<Pressable
							key={t.id}
							onPress={() => handleRowPress(t.id)}
							testID={`transaction-row-${t.id}`}>
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
							{isExpanded && (
								<View
									style={[styles.expandedDetails]}
									testID={`transaction-details-${t.id}`}>
									{/* DATE */}
									<View style={styles.detailRow}>
										{/* LEFT */}
										<AppText style={styles.detailLabel}>
											Date
										</AppText>
										{/* RIGHT */}
										<AppText style={styles.detailValue}>
											{humanReadableDate(
												new Date(t.date),
												'long',
												'numeric',
												'2-digit',
											)}
										</AppText>
									</View>

									{/* TYPE */}
									<View style={styles.detailRow}>
										<AppText style={styles.detailLabel}>
											Type
										</AppText>
										<AppText style={styles.detailValue}>
											{t.transactionType
												.charAt(0)
												.toUpperCase() +
												t.transactionType.slice(1)}
										</AppText>
									</View>

									{/* CATEGORY */}
									<View style={styles.detailRow}>
										<View style={styles.detailRow}>
											<AppText
												style={styles.detailLabel}>
												Category
											</AppText>
											<AppText
												style={styles.detailValue}>
												{t.category.join(' › ')}
											</AppText>
										</View>
									</View>

									{/* MERCHANT */}
									<View style={styles.detailRow}>
										<AppText style={styles.detailLabel}>
											Merchant
										</AppText>
										<AppText style={styles.detailValue}>
											{t.merchant}
										</AppText>
									</View>
								</View>
							)}
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
}
