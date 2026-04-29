import ActionButtonList, {
	ActionButtonItem,
} from '@components/ActionButtonList/ActionButtonList';
import AppText from '@components/AppText/AppText';
import BalanceHeader from '@components/BalanceHeader/BalanceHeader';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import TransactionsTable from '@components/TransactionsTable/TransactionsTable';
import { TestID } from '@enums/TestID';
import useGreeting from '@hooks/useGreeting';
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
import { useOpenAiService } from '@providers/OpenAiServiceProvider';
import {
	AppColors,
	radius,
	spacing,
	shadows,
	typography,
} from '@theme/tokens';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AiChatView from '@screens/HomeScreen/AiChatView';
import { useTheme } from '@providers/ThemeProvider';
import { benchmarkService } from '@services/BenchmarkService';
import { sortMessagesByCreatedAt } from '@utils/messageUtils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Animated,
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
	const { messages: reactiveAiMessages, isLoaded: isMessagesLoaded } =
		useReactiveAIMessages(db, threadId);
	const transactions = useReactiveTransactions(db);
	const { aiService } = useOpenAiService();
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
				: [],
			merchant: transaction.merchant || '',
		}));
	}, [transactions]);

	const balance = useTransactionBalance(db);
	const footerActions = useMemo<ActionButtonItem[]>(
		() => [
			{
				id: 'add_manual_transaction',
				title: 'Add Transaction',
				type: 'primary',
				testID: `${TestID.HomeScreen}-AddTransactionButton`,
			},
			{
				id: 'go_to_settings',
				title: 'Go to Settings',
				type: 'secondary',
				testID: `${TestID.HomeScreen}-GoToSettingsButton`,
			},
		],
		[],
	);

	useGreeting({
		threadId,
		messages: reactiveAiMessages,
		isMessagesLoaded,
		aiService,
	});

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

	const handleFooterAction = useCallback(
		(itemId: string) => {
			if (itemId === 'add_manual_transaction') {
				_props.navigation.navigate(
					AppStackScreens.ManualTransaction,
				);
				return;
			}

			if (itemId === 'go_to_settings') {
				_props.navigation.navigate(AppStackScreens.Settings);
			}
		},
		[_props.navigation],
	);

	return (
		<ThemedScreen testID={TestID.HomeScreen}>
			<View style={styles.screen}>
				<View style={styles.header}>
					<AppText style={styles.eyebrow}>Assistant</AppText>
					<AppText variant="titleLarge" style={styles.title}>
						Budget AI
					</AppText>
				</View>
				<View style={styles.balanceSection}>
					<BalanceHeader balance={balance} />
				</View>
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
					<ActionButtonList
						items={footerActions}
						onPressItem={handleFooterAction}
					/>
				</View>
			</View>
		</ThemedScreen>
	);
};

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.neutral.background,
			paddingHorizontal: spacing.lg,
			paddingTop: spacing.md + 1,
			paddingBottom: spacing.lg,
		},
		header: {
			paddingHorizontal: spacing.sm,
			marginBottom: spacing.sm,
		},
		balanceSection: {
			marginBottom: spacing.md,
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
		},
	});

export default HomeScreen;
