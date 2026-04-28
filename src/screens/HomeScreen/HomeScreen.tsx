import BalanceHeader from '@components/BalanceHeader/BalanceHeader';
import PrimaryButton from '@components/PrimaryButton';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import useLoadThread from '@hooks/useLoadThread';
import { useReactiveAIMessages } from '@hooks/useReactiveAIMessages';
import { useTransactionBalance } from '@hooks/useTransactionBalance';
import {
	AppStackParamList,
	AppStackScreens,
} from '@navigation/AppStack/AppStack';
import { useAuthStore } from '@providers/AuthProvider';
import { useDatabase } from '@providers/DatabaseProvider';
import {
	colors,
	radius,
	spacing,
	shadows,
	typography,
} from '@theme/tokens';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AiChatView from '@screens/HomeScreen/AiChatView';
import { benchmarkService } from '@services/BenchmarkService';
import { sortMessagesByCreatedAt } from '@utils/messageUtils';
import { useEffect, useMemo } from 'react';
import { DevSettings, StyleSheet, Text, View } from 'react-native';

type Props = NativeStackScreenProps<
	AppStackParamList,
	AppStackScreens.Home,
	'AppStack'
>;

const HomeScreen = (_props: Props) => {
	// hooks
	const { logout } = useAuthStore();
	const { db } = useDatabase();
	const { threadId } = useLoadThread(db);
	const reactiveAiMessages = useReactiveAIMessages(db, threadId);

	// memoized values
	const messages = useMemo(() => {
		return sortMessagesByCreatedAt(reactiveAiMessages);
	}, [reactiveAiMessages]);

	const balance = useTransactionBalance(db);

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

	return (
		<ThemedScreen testID={TestID.HomeScreen}>
			<View style={styles.screen}>
				<View style={styles.header}>
					<Text style={styles.eyebrow}>Assistant</Text>
					<Text style={styles.title}>Budget AI</Text>
				</View>
				<View style={styles.balanceSection}>
					<BalanceHeader balance={balance} />
				</View>
				<View style={styles.chatContainer}>
					<AiChatView threadId={threadId} messages={messages} />
				</View>
				<View style={styles.footer}>
					<PrimaryButton
						title="Go to Settings"
						onPress={() => {
							_props.navigation.navigate(
								AppStackScreens.Settings,
							);
						}}
						testID={`${TestID.HomeScreen}-GoToSettingsButton`}
						type="secondary"
					/>
				</View>
			</View>
		</ThemedScreen>
	);
};

const styles = StyleSheet.create({
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
	footer: {
		marginTop: spacing.lg - 2,
		paddingHorizontal: spacing.sm,
		alignItems: 'center',
	},
});

export default HomeScreen;
