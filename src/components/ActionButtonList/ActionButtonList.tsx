import PrimaryButton from '@components/PrimaryButton/PrimaryButton';
import { spacing } from '@theme/tokens';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export type ActionButtonItem = {
	id: string;
	title: string;
	type: 'primary' | 'secondary' | 'tertiary';
	testID?: string;
};

type ActionButtonListProps = {
	items: ActionButtonItem[];
	onPressItem: (itemId: string) => void;
};

const ActionButtonList: React.FC<ActionButtonListProps> = ({
	items,
	onPressItem,
}) => {
	return (
		<View style={styles.container}>
			{items.map((item, index) => (
				<PrimaryButton
					key={item.id}
					testID={item.testID}
					title={item.title}
					onPress={() => {
						onPressItem(item.id);
					}}
					width="100%"
					type={item.type}
					style={
						index < items.length - 1
							? styles.actionButton
							: undefined
					}
				/>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
	},
	actionButton: {
		marginBottom: spacing.md,
	},
});

export default ActionButtonList;
