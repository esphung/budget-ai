import InsightsCard from '@components/InsightsCard/InsightsCard';
import LinkedAccountsTable from '@components/LinkedAccountsTable/LinkedAccountsTable';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import TransactionsTable from '@components/TransactionsTable/TransactionsTable';
import { TestID } from '@enums/TestID';
import { usePlaidLink } from '@hooks/usePlaidLink';
import { useAuthStore } from '@providers/AuthProvider';
import { useInsightsStore } from '@providers/InsightsProvider';
import { apiClient, type PlaidTransaction } from '@services/ApiClient';
import styles from '@screens/TestScreen/TestScreen.styles';
import { useCallback, useState } from 'react';
import {
ActivityIndicator,
Button,
ScrollView,
Text,
TouchableOpacity,
View,
} from 'react-native';
import { LinkAccount } from 'react-native-plaid-link-sdk';

interface Transaction {
id: string;
name: string;
amount: number;
date: string;
category: string[];
}

function mapPlaidTransaction(t: PlaidTransaction): Transaction {
return {
id: t.transaction_id,
name: t.name,
amount: t.amount,
date: t.date,
category: t.category ?? [],
};
}

const TestScreen = () => {
const { logout } = useAuthStore();
const { fetchInsights, clearInsights, insights, isLoading, error } =
useInsightsStore();

const [accounts, setAccounts] = useState<LinkAccount[] | null>(null);
const [transactions, setTransactions] = useState<Transaction[] | null>(
null,
);
const [fetchError, setFetchError] = useState<string | null>(null);

/**
 * Fetches the latest transactions and balances from the server, updates
 * the local table state, and triggers insight generation. Shared by
 * both the post-link handler and the manual refresh button.
 */
const loadData = useCallback(async () => {
setFetchError(null);
try {
const [txnResponse, balanceResponse] = await Promise.all([
apiClient.plaid.getTransactions(),
apiClient.plaid.getBalances(),
]);
setTransactions(
txnResponse.transactions.map(mapPlaidTransaction),
);
await fetchInsights(
txnResponse.transactions,
balanceResponse.accounts,
);
} catch (err: unknown) {
const message =
err instanceof Error
? err.message
: 'Failed to load financial data';
setFetchError(message);
}
}, [fetchInsights]);

const { isStarting, startPlaidLink } = usePlaidLink({
onLinkedAccounts: async (linkedAccounts) => {
setAccounts(linkedAccounts);
clearInsights();
await loadData();
},
onExit: (linkExit) => {
console.debug('[Plaid Link] Exit:', linkExit);
},
});

const handleRefreshInsights = async () => {
if (!accounts) {
return;
}
clearInsights();
await loadData();
};

return (
<ThemedScreen>
<ScrollView
contentContainerStyle={styles.scrollContent}
testID={TestID.TestScreen}>
<View style={styles.buttonContainer}>
<TouchableOpacity
style={[
styles.button,
isStarting && styles.buttonDisabled,
]}
disabled={isStarting}
onPress={startPlaidLink}>
<Text style={styles.buttonText}>
{isStarting
? 'Starting Plaid...'
: 'Open Plaid Link'}
</Text>
</TouchableOpacity>
</View>

{accounts && <LinkedAccountsTable accounts={accounts} />}
{transactions && (
<TransactionsTable transactions={transactions} />
)}

{fetchError && (
<View style={styles.errorCard}>
<Text style={styles.errorText}>{fetchError}</Text>
</View>
)}

{isLoading && (
<View style={styles.loadingContainer}>
<ActivityIndicator size="small" color="#007AFF" />
<Text style={styles.loadingText}>
Generating AI insights…
</Text>
</View>
)}

{error && !isLoading && (
<View style={styles.errorCard}>
<Text style={styles.errorText}>{error}</Text>
</View>
)}

{insights.length > 0 && (
<View style={styles.insightsSection}>
<View style={styles.insightsSectionHeader}>
<Text style={styles.insightsSectionTitle}>
AI Insights
</Text>
<TouchableOpacity
onPress={handleRefreshInsights}
disabled={isLoading}>
<Text style={styles.refreshText}>
Refresh
</Text>
</TouchableOpacity>
</View>
{insights.map((insight) => (
<InsightsCard
key={insight.id}
insight={insight}
/>
))}
</View>
)}

<Button title="Logout" onPress={logout} />
</ScrollView>
</ThemedScreen>
);
};

export default TestScreen;
