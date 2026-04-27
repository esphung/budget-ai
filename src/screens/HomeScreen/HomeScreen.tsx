import Panel from '@components/Panel/Panel';
import PrimaryButton from '@components/PrimaryButton';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import { useAuthStore } from '@providers/AuthProvider';
import { benchmarkService } from '@services/BenchmarkService';
import { useLayoutEffect } from 'react';
import { StyleSheet } from 'react-native';

const SHOW_BORDERS = false;

const useBenchmark = () => {
	useLayoutEffect(() => {
		benchmarkService.stop('bootstrap');
		console.log(benchmarkService.getResults('bootstrap'));
	}, []);
};

const HomeScreen = () => {
	const { logout } = useAuthStore();

	// stop benchmark when HomeScreen mounts
	useBenchmark();

	return (
		<ThemedScreen testID={TestID.HomeScreen}>
			<Panel type="north" showBorder={SHOW_BORDERS} />
			<Panel type="center" showBorder={SHOW_BORDERS} />
			<Panel
				type="south"
				style={styles.southPanel}
				showBorder={SHOW_BORDERS}>
				<PrimaryButton
					type="tertiary"
					title="Logout"
					onPress={logout}
					testID={TestID.LogoutButton}
				/>
			</Panel>
		</ThemedScreen>
	);
};

const styles = StyleSheet.create({
	southPanel: {
		justifyContent: 'center',
		alignItems: 'center',
	},
});

export default HomeScreen;
