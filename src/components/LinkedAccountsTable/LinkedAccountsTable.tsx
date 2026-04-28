import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import { createStyles } from '@components/LinkedAccountsTable/LinkedAccountsTable.styles';
import { useMemo } from 'react';
import { View } from 'react-native';
import { LinkAccount } from 'react-native-plaid-link-sdk';

interface LinkedAccountsTableProps {
	accounts: LinkAccount[];
}

export default function LinkedAccountsTable({
	accounts,
}: LinkedAccountsTableProps) {
	const { colors } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);

	return (
		<View style={styles.tableContainer}>
			<AppText style={styles.tableTitle}>Linked Accounts</AppText>
			<View style={styles.tableRow}>
				<AppText
					style={[
						styles.tableCell,
						styles.tableHeader,
						styles.tableCellWide,
					]}>
					Name
				</AppText>
				<AppText style={[styles.tableCell, styles.tableHeader]}>
					Type
				</AppText>
				<AppText style={[styles.tableCell, styles.tableHeader]}>
					Mask
				</AppText>
			</View>
			{accounts.map((a) => (
				<View key={a.id} style={styles.tableRow}>
					<AppText
						style={[styles.tableCell, styles.tableCellWide]}>
						{a.name}
					</AppText>
					<AppText style={styles.tableCell}>
						{String(a.subtype)}
					</AppText>
					<AppText style={styles.tableCell}>••{a.mask}</AppText>
				</View>
			))}
		</View>
	);
}
