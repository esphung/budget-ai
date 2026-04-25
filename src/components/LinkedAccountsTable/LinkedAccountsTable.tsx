import styles from '@components/LinkedAccountsTable/LinkedAccountsTable.styles';
import { Text, View } from 'react-native';
import { LinkAccount } from 'react-native-plaid-link-sdk';

interface LinkedAccountsTableProps {
	accounts: LinkAccount[];
}

export default function LinkedAccountsTable({
	accounts,
}: LinkedAccountsTableProps) {
	return (
		<View style={styles.tableContainer}>
			<Text style={styles.tableTitle}>Linked Accounts</Text>
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
					Type
				</Text>
				<Text style={[styles.tableCell, styles.tableHeader]}>
					Mask
				</Text>
			</View>
			{accounts.map((a) => (
				<View key={a.id} style={styles.tableRow}>
					<Text style={[styles.tableCell, styles.tableCellWide]}>
						{a.name}
					</Text>
					<Text style={styles.tableCell}>
						{String(a.subtype)}
					</Text>
					<Text style={styles.tableCell}>••{a.mask}</Text>
				</View>
			))}
		</View>
	);
}
