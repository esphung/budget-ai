import { TestID } from '@enums/TestID';
import { useEvaluateFlag } from '@providers/FeatureFlagsProvider';
import { useOpenAiService } from '@providers/OpenAiServiceProvider';
import HomeScreen from '@screens/HomeScreen/HomeScreen';
import { benchmarkService } from '@services/BenchmarkService';
import { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

// Custom hook for initializing the welcome message
const useInitializeWelcomeMessage = () => {
	const newChatEnabledBool = useEvaluateFlag('newChatEnabled');
	const openAiService = useOpenAiService();

	useEffect(() => {
		if (!newChatEnabledBool) {
			benchmarkService.stop('launchGreeting');
			benchmarkService.getResults('launchGreeting');
			return;
		}

		benchmarkService.start('launchGreeting');
		openAiService.getLaunchGreeting().then((response) => {
			benchmarkService.stop('launchGreeting');
			benchmarkService.getResults('launchGreeting');
			Alert.alert(
				'Welcome Message',
				openAiService.parseChatResponse(response),
			);
		});
	}, [openAiService, newChatEnabledBool]);
};

const AppStack = () => {
	useInitializeWelcomeMessage();

	return (
		<View testID={TestID.AppStack} style={styles.container}>
			<HomeScreen />
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1 },
});

export default AppStack;
