import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import useLoadThread from '@hooks/useLoadThread';
import { useReactiveAIMessages } from '@hooks/useReactiveAIMessages';
import { useAuthStore } from '@providers/AuthProvider';
import { useDatabase } from '@providers/DatabaseProvider';
import AiChatView from '@screens/HomeScreen/AiChatView';
import { benchmarkService } from '@services/BenchmarkService';
import { sortMessagesByCreatedAt } from '@utils/messageUtils';
import { useEffect, useMemo } from 'react';
import { DevSettings } from 'react-native';

const HomeScreen = () => {
	// hooks
	const { logout } = useAuthStore();
	const { db } = useDatabase();

	// state
	const { threadId } = useLoadThread(db);
	const reactiveAiMessages = useReactiveAIMessages(db, threadId);

	// memoized values
	const messages = useMemo(() => {
		return sortMessagesByCreatedAt(reactiveAiMessages);
	}, [reactiveAiMessages]);

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
			<AiChatView threadId={threadId} db={db} messages={messages} />
		</ThemedScreen>
	);
};

export default HomeScreen;
