import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { TestID } from '@enums/TestID';
import { NavigationService } from '@navigation/navigationService';
import { useAuthStore } from '@providers/AuthProvider';
import {
	colors,
	radius,
	spacing,
	shadows,
	typography,
} from '@theme/tokens';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const DATA = [
	{
		id: 'go_back',
		title: 'Go Back',
		type: 'secondary' as const,
	},
	{
		id: 'logout',
		title: 'Logout',
		type: 'tertiary' as const,
	},
];

type Item = {
	id: string;
	title: string;
	type: 'primary' | 'secondary' | 'tertiary';
};

const SettingsActions = ({ onLogout }: { onLogout: () => void }) => {
	const handleAction = useCallback(
		(itemId: string) => {
			if (itemId === 'go_back') {
				NavigationService.goBack();
			} else if (itemId === 'logout') {
				onLogout();
			}
		},
		[onLogout],
	);

	return (
		<View style={styles.actionsContainer}>
			{DATA.map((item: Item) => (
				<PrimaryButton
					key={item.id}
					testID={`SettingsOption-${item.id}`}
					title={item.title}
					onPress={() => handleAction(item.id)}
					width="100%"
					type={item.type}
					style={styles.actionButton}
				/>
			))}
		</View>
	);
};

const SettingsScreen = () => {
	const { logout } = useAuthStore();
	return (
		<ThemedScreen>
			<View style={styles.screen} testID={TestID.SettingsScreen}>
				<View style={styles.card}>
					<Text style={styles.eyebrow}>Account</Text>
					<Text style={styles.title}>Settings</Text>
					<Text style={styles.subtitle}>
						Choose an action to continue.
					</Text>
					<SettingsActions onLogout={logout} />
				</View>
			</View>
		</ThemedScreen>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		justifyContent: 'center',
		paddingHorizontal: spacing.xl,
		backgroundColor: colors.neutral.background,
	},
	card: {
		width: '100%',
		maxWidth: 480,
		alignSelf: 'center',
		backgroundColor: colors.neutral.surface,
		borderRadius: radius.lg,
		paddingVertical: spacing.xxl,
		paddingHorizontal: spacing.xl,
		...shadows.xl,
	},
	eyebrow: {
		...typography.eyebrow,
		textTransform: 'uppercase',
		letterSpacing: 1.2,
		color: colors.neutral.textTertiary,
		marginBottom: spacing.md - 2,
	},
	title: {
		...typography.titleLarge,
		color: colors.neutral.text,
		marginBottom: spacing.sm,
	},
	subtitle: {
		...typography.subtitle,
		color: colors.neutral.textSecondary,
		marginBottom: spacing.xl,
	},
	actionsContainer: {
		width: '100%',
	},
	actionButton: {
		marginBottom: spacing.md,
	},
});

export default SettingsScreen;
