import AppText from '@components/AppText/AppText';
import BalanceHeader from '@components/BalanceHeader/BalanceHeader';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import TopCard from '@components/TopCard';
import TransactionsTable from '@components/TransactionsTable/TransactionsTable';
import { TestID } from '@enums/TestID';
import useLoadThread from '@hooks/useLoadThread';
import { useReactiveAIMessages } from '@hooks/useReactiveAIMessages';
import { useReactiveTransactions } from '@hooks/useReactiveTransactions';
import { useTransactionBalance } from '@hooks/useTransactionBalance';
import {
	AppStackParamList,
	AppStackScreens,
} from '@navigation/AppStack/AppStack';
import { useAuthStore } from '@providers/AuthProvider';
import { useDatabase } from '@providers/DatabaseProvider';
import { useTheme } from '@providers/ThemeProvider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TransactionRepository } from '@repositories/TransactionRepository';
import AiChatView from '@screens/HomeScreen/AiChatView';
import { benchmarkService } from '@services/BenchmarkService';
import {
	AppColors,
	radius,
	shadows,
	spacing,
	typography,
} from '@theme/tokens';
import { DeleteTransaction } from '@usecases/deleteTransaction';
import { sortMessagesByCreatedAt } from '@utils/messageUtils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Animated,
	Alert,
	DevSettings,
	Easing,
	Pressable,
	StyleSheet,
	View,
} from 'react-native';

type Props = NativeStackScreenProps<
	AppStackParamList,
	AppStackScreens.Home,
	'AppStack'
>;

const HomeScreen = (_props: Props) => {
	// hooks
	const { logout } = useAuthStore();
	const { colors } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { db } = useDatabase();
	const { threadId } = useLoadThread(db);
	const { messages: reactiveAiMessages } = useReactiveAIMessages(
		db,
		threadId,
	);
	const transactions = useReactiveTransactions(db);
	const [activeView, setActiveView] = useState<'chat' | 'transactions'>(
		'chat',
	);
	const [displayedView, setDisplayedView] = useState<
		'chat' | 'transactions'
	>('chat');
	const contentOpacity = useRef(new Animated.Value(1)).current;
	const contentTranslateY = useRef(new Animated.Value(0)).current;
	const pillProgress = useRef(new Animated.Value(0)).current;
	const [toggleWidth, setToggleWidth] = useState(0);

	// memoized values
	const messages = useMemo(() => {
		return sortMessagesByCreatedAt(reactiveAiMessages);
	}, [reactiveAiMessages]);

	const tableTransactions = useMemo(() => {
		return transactions.map((transaction) => ({
			...transaction,
			id: transaction.id,
			name: transaction.merchant || 'Transaction',
			amount: transaction.amount,
			transactionType: transaction.transactionType as
				| 'income'
				| 'expense'
				| 'transfer',
			date: transaction.date,
			category: transaction.category
				? transaction.category
						.split(',')
						.map((value) => value.trim())
						.filter(Boolean)
						.join(', ') || null
				: null,
			merchant: transaction.merchant || '',
			source: 'manual' as const,
		}));
	}, [transactions]);

	const balance = useTransactionBalance(db);

	const handleDeleteTransaction = useCallback(
		(transactionId: string, transactionName: string) => {
			if (!db) {
				return;
			}

			Alert.alert(
				'Delete transaction?',
				`This will permanently remove ${transactionName} from local storage.`,
				[
					{ text: 'Cancel', style: 'cancel' },
					{
						text: 'Delete',
						style: 'destructive',
						onPress: async () => {
							await new DeleteTransaction(
								new TransactionRepository(db),
							).execute(transactionId);
						},
					},
				],
			);
		},
		[db],
	);

	// side effects
	useEffect(() => {
		// onmount, start benchmark timer for app launch
		benchmarkService.stop('bootstrap');
	}, []);

	useEffect(() => {
		// debug menu for logging out - only in dev mode
		if (__DEV__) {
			DevSettings.addMenuItem('Logout', async () => {
				logout();
			});
		}
	}, [logout]);

	useEffect(() => {
		if (activeView === displayedView) {
			return;
		}

		Animated.timing(contentOpacity, {
			toValue: 0,
			duration: 100,
			easing: Easing.out(Easing.quad),
			useNativeDriver: true,
		}).start(() => {
			setDisplayedView(activeView);
			contentTranslateY.setValue(6);
			Animated.parallel([
				Animated.timing(contentOpacity, {
					toValue: 1,
					duration: 170,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
				Animated.timing(contentTranslateY, {
					toValue: 0,
					duration: 170,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
			]).start();
		});
	}, [activeView, displayedView, contentOpacity, contentTranslateY]);

	useEffect(() => {
		Animated.timing(pillProgress, {
			toValue: activeView === 'chat' ? 0 : 1,
			duration: 190,
			easing: Easing.out(Easing.cubic),
			useNativeDriver: true,
		}).start();
	}, [activeView, pillProgress]);

	const handleAddTransaction = useCallback(() => {
		_props.navigation.navigate(AppStackScreens.ManualTransaction);
	}, [_props.navigation]);

	const handleGoToSettings = useCallback(() => {
		_props.navigation.navigate(AppStackScreens.Settings);
	}, [_props.navigation]);

	return (
		<ThemedScreen testID={TestID.HomeScreen}>
			<Animated.View style={styles.flex}>
				<View style={styles.screen}>
					<TopCard>
						<View style={styles.header}>
							<AppText style={styles.eyebrow}>
								Assistant
							</AppText>
							<AppText
								variant="titleLarge"
								style={styles.title}>
								Budget AI
							</AppText>
						</View>
						<View style={styles.balanceSection}>
							<BalanceHeader
								balance={balance}
								variant="plain"
							/>
						</View>
					</TopCard>

					<View
						style={styles.toggleContainer}
						onLayout={(event) => {
							setToggleWidth(event.nativeEvent.layout.width);
						}}>
						<Animated.View
							pointerEvents="none"
							style={[
								styles.togglePillIndicator,
								{
									width: toggleWidth
										? toggleWidth / 2 - 4
										: 0,
									transform: [
										{
											translateX: Animated.multiply(
												pillProgress,
												toggleWidth
													? toggleWidth / 2
													: 0,
											),
										},
									],
								},
							]}
						/>
						<Pressable
							testID={`${TestID.HomeScreen}-ViewChatPill`}
							onPress={() => {
								setActiveView('chat');
							}}
							style={({ pressed }) => [
								styles.togglePill,
								pressed && styles.togglePillPressed,
							]}>
							<AppText
								style={[
									styles.toggleLabel,
									activeView === 'chat' &&
										styles.toggleLabelActive,
								]}>
								Chat
							</AppText>
						</Pressable>
						<Pressable
							testID={`${TestID.HomeScreen}-ViewTransactionsPill`}
							onPress={() => {
								setActiveView('transactions');
							}}
							style={({ pressed }) => [
								styles.togglePill,
								pressed && styles.togglePillPressed,
							]}>
							<AppText
								style={[
									styles.toggleLabel,
									activeView === 'transactions' &&
										styles.toggleLabelActive,
								]}>
								Transactions
							</AppText>
						</Pressable>
					</View>
					<View style={styles.chatContainer}>
						<Animated.View
							style={[
								styles.animatedContent,
								{
									opacity: contentOpacity,
									transform: [
										{ translateY: contentTranslateY },
									],
								},
							]}>
							{displayedView === 'chat' ? (
								<AiChatView
									threadId={threadId}
									messages={messages}
								/>
							) : (
								<View style={styles.transactionsContainer}>
									{tableTransactions.length ? (
										<TransactionsTable
											transactions={tableTransactions}
											onDeleteTransaction={(
												transaction,
											) => {
												handleDeleteTransaction(
													transaction.id,
													transaction.name,
												);
											}}
										/>
									) : (
										<AppText
											style={
												styles.emptyTransactionsText
											}>
											No transactions yet.
										</AppText>
									)}
								</View>
							)}
						</Animated.View>
					</View>
					<View style={styles.footer}>
						<Pressable
							style={({ pressed }) => [
								styles.iconButton,
								pressed && styles.iconButtonPressed,
							]}
							onPress={handleAddTransaction}
							testID={`${TestID.HomeScreen}-AddTransactionButton`}>
							<AppText style={styles.iconButtonSymbol}>
								+
							</AppText>
							<AppText style={styles.iconButtonLabel}>
								Add
							</AppText>
						</Pressable>
						<Pressable
							style={({ pressed }) => [
								styles.iconButton,
								styles.iconButtonSecondary,
								pressed && styles.iconButtonPressed,
							]}
							onPress={handleGoToSettings}
							testID={`${TestID.HomeScreen}-GoToSettingsButton`}>
							<AppText
								style={[
									styles.iconButtonSymbol,
									styles.iconButtonSymbolSecondary,
								]}>
								⚙️
							</AppText>
							<AppText
								style={[
									styles.iconButtonLabel,
									styles.iconButtonLabelSecondary,
								]}>
								Settings
							</AppText>
						</Pressable>
					</View>
				</View>
			</Animated.View>
		</ThemedScreen>
	);
};

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		flex: {
			flex: 1,
		},
		screen: {
			flex: 1,
			backgroundColor: colors.neutral.background,
			paddingHorizontal: spacing.lg,
			paddingBottom: spacing.lg,
		},
		header: {
			alignItems: 'center',
			marginBottom: spacing.md,
		},
		balanceSection: {
			marginBottom: 0,
		},
		toggleContainer: {
			position: 'relative',
			flexDirection: 'row',
			backgroundColor: colors.neutral.surface,
			borderRadius: radius.full,
			padding: spacing.xs,
			marginBottom: spacing.md,
			gap: spacing.xs,
			overflow: 'hidden',
			...shadows.sm,
		},
		togglePillIndicator: {
			position: 'absolute',
			left: 2,
			top: 2,
			bottom: 2,
			borderRadius: radius.full,
			backgroundColor: colors.primary.base,
		},
		togglePill: {
			flex: 1,
			alignItems: 'center',
			justifyContent: 'center',
			paddingVertical: spacing.sm,
			borderRadius: radius.full,
		},
		togglePillPressed: {
			transform: [{ scale: 0.97 }],
		},
		toggleLabel: {
			...typography.small,
			color: colors.neutral.textSecondary,
		},
		toggleLabelActive: {
			color: colors.chat.userText,
		},
		eyebrow: {
			...typography.eyebrow,
			textTransform: 'uppercase',
			color: colors.neutral.textTertiary,
			marginBottom: spacing.sm,
		},
		title: {
			...typography.titleLarge,
			color: colors.neutral.text,
		},
		chatContainer: {
			flex: 1,
			backgroundColor: colors.neutral.surface,
			borderRadius: radius.lg,
			overflow: 'hidden',
			...shadows.lg,
		},
		animatedContent: {
			flex: 1,
		},
		transactionsContainer: {
			flex: 1,
			padding: spacing.md,
		},
		emptyTransactionsText: {
			...typography.body,
			color: colors.neutral.textSecondary,
			textAlign: 'center',
			marginTop: spacing.xl,
		},
		footer: {
			marginTop: spacing.lg - 2,
			width: '100%',
			maxWidth: 480,
			alignSelf: 'center',
			flexDirection: 'row',
			justifyContent: 'center',
			gap: spacing.lg,
		},
		iconButton: {
			alignItems: 'center',
			gap: 6,
			paddingVertical: spacing.sm,
			paddingHorizontal: spacing.lg,
			borderRadius: radius.xl,
			backgroundColor: colors.primary.base,
			shadowColor: colors.primary.base,
			shadowOffset: { width: 0, height: 6 },
			shadowOpacity: 0.22,
			shadowRadius: 12,
			elevation: 3,
			minWidth: 88,
		},
		iconButtonSecondary: {
			backgroundColor: colors.neutral.surface,
			shadowColor: colors.neutral.border,
			shadowOpacity: 0.12,
		},
		iconButtonPressed: {
			opacity: 0.75,
			transform: [{ scale: 0.96 }],
		},
		iconButtonSymbol: {
			fontSize: 24,
			lineHeight: 28,
			color: '#FFFFFF',
			fontWeight: '600',
		},
		iconButtonSymbolSecondary: {
			color: colors.neutral.text,
		},
		iconButtonLabel: {
			fontSize: 11,
			fontWeight: '600',
			letterSpacing: 0.3,
			color: 'rgba(255,255,255,0.85)',
		},
		iconButtonLabelSecondary: {
			color: colors.neutral.textSecondary,
		},
	});

export default HomeScreen;
