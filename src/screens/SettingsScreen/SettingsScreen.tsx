import ActionButtonList, {
	ActionButtonItem,
} from '@components/ActionButtonList/ActionButtonList';
import AppText from '@components/AppText/AppText';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import TopCard from '@components/TopCard';
import { TestID } from '@enums/TestID';
import { AppStackScreens } from '@navigation/AppStack/AppStack';
import { NavigationService } from '@navigation/navigationService';
import { useAuthStore } from '@providers/AuthProvider';
import { useDatabase } from '@providers/DatabaseProvider';
import { useTheme } from '@providers/ThemeProvider';
import { AccountRepository } from '@repositories/AccountRepository';
import { BudgetRepository } from '@repositories/BudgetRepository';
import { CategoryRepository } from '@repositories/CategoryRepository';
import { TransactionRepository } from '@repositories/TransactionRepository';
import { AppColors, radius, spacing, shadows } from '@theme/tokens';
import { ClearAccounts } from '@usecases/clearAccounts';
import { ClearBudgets } from '@usecases/clearBudgets';
import { ClearCategories } from '@usecases/clearCategories';
import { ClearTransactions } from '@usecases/clearTransactions';
import { useCallback, useMemo } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';

const BASE_ACTIONS: ActionButtonItem[] = [
	{
		id: 'test_screen',
		title: 'Go to Test Screen',
		type: 'primary',
		testID: 'SettingsOption-test_screen',
	},
	{
		id: 'go_back',
		title: 'Go Back',
		type: 'secondary',
		testID: 'SettingsOption-go_back',
	},
	{
		id: 'logout',
		title: 'Logout',
		type: 'secondary',
		testID: 'SettingsOption-logout',
	},
];

const DEV_ACTIONS: ActionButtonItem[] = [
	{
		id: 'clear_transactions',
		title: 'Clear Transactions',
		type: 'tertiary',
		testID: 'SettingsOption-clear_transactions',
	},
	{
		id: 'clear_accounts',
		title: 'Clear Accounts',
		type: 'tertiary',
		testID: 'SettingsOption-clear_accounts',
	},
	{
		id: 'clear_budgets',
		title: 'Clear Budgets',
		type: 'tertiary',
		testID: 'SettingsOption-clear_budgets',
	},
	{
		id: 'clear_categories',
		title: 'Clear Categories',
		type: 'tertiary',
		testID: 'SettingsOption-clear_categories',
	},
];

type SwitchItem = {
	id: string;
	title: string;
	description: string;
};

const SWITCH_ITEMS: SwitchItem[] = [
	{
		id: 'dark_mode',
		title: 'Dark mode',
		description: 'Switch between dark and light themes.',
	},
];

const SettingsActions = ({
	onLogout,
	onClearTransactions,
	onClearAccounts,
	onClearBudgets,
	onClearCategories,
}: {
	onLogout: () => void;
	onClearTransactions: () => void;
	onClearAccounts: () => void;
	onClearBudgets: () => void;
	onClearCategories: () => void;
}) => {
	const actions = useMemo(
		() => (__DEV__ ? [...BASE_ACTIONS, ...DEV_ACTIONS] : BASE_ACTIONS),
		[],
	);

	const handleAction = useCallback(
		(itemId: string) => {
			if (itemId === 'go_back') {
				NavigationService.goBack();
			} else if (itemId === 'logout') {
				onLogout();
			} else if (itemId === 'test_screen') {
				NavigationService.navigateToScreen(AppStackScreens.Test);
			} else if (itemId === 'clear_transactions') {
				onClearTransactions();
			} else if (itemId === 'clear_accounts') {
				onClearAccounts();
			} else if (itemId === 'clear_budgets') {
				onClearBudgets();
			} else if (itemId === 'clear_categories') {
				onClearCategories();
			}
		},
		[
			onClearAccounts,
			onClearBudgets,
			onClearCategories,
			onClearTransactions,
			onLogout,
		],
	);

	return <ActionButtonList items={actions} onPressItem={handleAction} />;
};

const SettingsSwitches = ({
	styles,
}: {
	styles: ReturnType<typeof createStyles>;
}) => {
	const { colors, isDarkMode, setThemeMode } = useTheme();

	const handleValueChange = useCallback(
		(value: boolean) => {
			setThemeMode(value ? 'dark' : 'light');
		},
		[setThemeMode],
	);

	return (
		<View style={styles.switchList}>
			{SWITCH_ITEMS.map((item) => (
				<View key={item.id} style={styles.switchRow}>
					<View style={styles.switchCopy}>
						<AppText
							variant="bodyMedium"
							style={styles.switchTitle}>
							{item.title}
						</AppText>
						<AppText
							variant="small"
							style={styles.switchDescription}>
							{item.description}
						</AppText>
					</View>
					<Switch
						testID={`SettingsSwitch-${item.id}`}
						value={isDarkMode}
						onValueChange={handleValueChange}
						trackColor={{
							false: colors.neutral.border,
							true: colors.primary.light,
						}}
						thumbColor={
							isDarkMode
								? colors.primary.base
								: colors.neutral.surface
						}
						ios_backgroundColor={colors.neutral.borderLight}
					/>
				</View>
			))}
		</View>
	);
};

const SettingsScreen = () => {
	const { logout } = useAuthStore();
	const { db } = useDatabase();
	const { colors } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const clearTransactions = useCallback(() => {
		if (!db) {
			return;
		}

		Alert.alert(
			'Clear transactions?',
			'This will remove all transactions from local state and database.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Clear',
					style: 'destructive',
					onPress: async () => {
						await new ClearTransactions(
							new TransactionRepository(db),
						).execute();
					},
				},
			],
		);
	}, [db]);

	const clearAccounts = useCallback(() => {
		if (!db) {
			return;
		}

		Alert.alert(
			'Clear accounts?',
			'This will remove all accounts from local state and database.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Clear',
					style: 'destructive',
					onPress: async () => {
						await new ClearAccounts(
							new AccountRepository(db),
						).execute();
					},
				},
			],
		);
	}, [db]);

	const clearBudgets = useCallback(() => {
		if (!db) {
			return;
		}

		Alert.alert(
			'Clear budgets?',
			'This will remove all budgets from local state and database.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Clear',
					style: 'destructive',
					onPress: async () => {
						await new ClearBudgets(
							new BudgetRepository(db),
						).execute();
					},
				},
			],
		);
	}, [db]);

	const clearCategories = useCallback(() => {
		if (!db) {
			return;
		}

		Alert.alert(
			'Clear categories?',
			'This will remove all categories from local state and database.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Clear',
					style: 'destructive',
					onPress: async () => {
						await new ClearCategories(
							new CategoryRepository(db),
						).execute();
					},
				},
			],
		);
	}, [db]);

	return (
		<ThemedScreen>
			<View style={styles.screen} testID={TestID.SettingsScreen}>
				<TopCard>
					<AppText variant="eyebrow" style={styles.eyebrow}>
						Account
					</AppText>
					<AppText variant="titleLarge" style={styles.title}>
						Settings
					</AppText>
					<AppText variant="subtitle" style={styles.subtitle}>
						Choose an action to continue.
					</AppText>
					<SettingsActions
						onLogout={logout}
						onClearTransactions={clearTransactions}
						onClearAccounts={clearAccounts}
						onClearBudgets={clearBudgets}
						onClearCategories={clearCategories}
					/>
				</TopCard>

				<View style={styles.switchesCard}>
					<AppText variant="eyebrow" style={styles.eyebrow}>
						Preferences
					</AppText>
					<AppText
						variant="subtitle"
						style={styles.switchesTitle}>
						Toggle Settings
					</AppText>
					<SettingsSwitches styles={styles} />
				</View>
			</View>
		</ThemedScreen>
	);
};

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			paddingHorizontal: spacing.lg,
			paddingBottom: spacing.lg,
			backgroundColor: colors.neutral.background,
		},
		switchesCard: {
			width: '100%',
			maxWidth: 480,
			alignSelf: 'center',
			backgroundColor: colors.neutral.surface,
			borderRadius: radius.lg,
			paddingVertical: spacing.lg,
			paddingHorizontal: spacing.lg,
			...shadows.lg,
		},
		eyebrow: {
			textTransform: 'uppercase',
			letterSpacing: 1.2,
			color: colors.neutral.textTertiary,
			marginBottom: spacing.md - 2,
		},
		title: {
			color: colors.neutral.text,
			marginBottom: spacing.sm,
		},
		subtitle: {
			color: colors.neutral.textSecondary,
			marginBottom: spacing.lg,
		},
		switchesTitle: {
			color: colors.neutral.text,
			marginBottom: spacing.md,
		},
		switchList: {
			gap: spacing.md,
		},
		switchRow: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: spacing.md,
			paddingVertical: spacing.md,
			borderWidth: 1,
			borderColor: colors.neutral.borderLight,
			borderRadius: radius.md,
			backgroundColor: colors.neutral.background,
		},
		switchCopy: {
			flex: 1,
			paddingRight: spacing.md,
		},
		switchTitle: {
			color: colors.neutral.text,
			marginBottom: spacing.xs,
		},
		switchDescription: {
			color: colors.neutral.textSecondary,
		},
	});

export default SettingsScreen;
