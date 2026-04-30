import MessageCard from '@components/Chat/MessageCard';
import { AIMessage } from '@db/types';
import AppText from '@components/AppText/AppText';
import { useTheme } from '@providers/ThemeProvider';
import React, { forwardRef, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { AppColors, spacing, typography } from '@theme/tokens';

const toDateKey = (value: string): string | null => {
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}

	return parsed.toISOString().slice(0, 10);
};

const readTransactionDateFromMetadata = (
	metadata?: Record<string, unknown> | null,
): string | null => {
	if (!metadata || typeof metadata !== 'object') {
		return null;
	}

	const payload = metadata.payload;
	if (!payload || typeof payload !== 'object') {
		return null;
	}

	const candidate = (payload as Record<string, unknown>).date;
	if (typeof candidate !== 'string' || !candidate.trim()) {
		return null;
	}

	return candidate;
};

const getMessageDayKey = (message: AIMessage): string => {
	const transactionDate = readTransactionDateFromMetadata(
		message.metadata,
	);

	return (
		(transactionDate && toDateKey(transactionDate)) ||
		toDateKey(message.createdAt) ||
		'unknown'
	);
};

const formatDayLabel = (dateKey: string): string => {
	if (dateKey === 'unknown') {
		return 'Unknown date';
	}

	const parsed = new Date(`${dateKey}T12:00:00.000Z`);
	if (Number.isNaN(parsed.getTime())) {
		return dateKey;
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const compared = new Date(parsed);
	compared.setHours(0, 0, 0, 0);

	const diffDays = Math.round(
		(today.getTime() - compared.getTime()) / 86400000,
	);

	if (diffDays === 0) {
		return 'Today';
	}

	if (diffDays === 1) {
		return 'Yesterday';
	}

	return parsed.toLocaleDateString(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

type ListItem =
	| { type: 'divider'; key: string; dateKey: string }
	| { type: 'message'; key: string; message: AIMessage };

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		dividerRow: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: spacing.sm,
			paddingVertical: spacing.sm,
			marginBottom: spacing.sm,
		},
		dividerLine: {
			flex: 1,
			height: 1,
			backgroundColor: colors.neutral.border,
		},
		dividerLabel: {
			...typography.small,
			color: colors.neutral.textTertiary,
		},
	});

const MessageList = forwardRef<FlatList, { messages: AIMessage[] }>(
	({ messages }, ref) => {
		const { colors } = useTheme();
		const styles = useMemo(() => createStyles(colors), [colors]);

		const data = useMemo(() => {
			const rows: ListItem[] = [];
			let previousDayKey: string | null = null;

			for (const message of messages) {
				const dayKey = getMessageDayKey(message);

				if (dayKey !== previousDayKey) {
					rows.push({
						type: 'divider',
						key: `divider-${dayKey}-${message.id}`,
						dateKey: dayKey,
					});
					previousDayKey = dayKey;
				}

				rows.push({
					type: 'message',
					key: message.id,
					message,
				});
			}

			return rows;
		}, [messages]);

		return (
			<FlatList
				ref={ref}
				data={data}
				keyExtractor={(item) => item.key}
				inverted
				keyboardDismissMode="on-drag"
				keyboardShouldPersistTaps="never"
				renderItem={({ item }) => {
					if (item.type === 'divider') {
						return (
							<View
								testID={`message-day-divider-${item.dateKey}`}
								style={styles.dividerRow}>
								<View style={styles.dividerLine} />
								<AppText style={styles.dividerLabel}>
									{formatDayLabel(item.dateKey)}
								</AppText>
								<View style={styles.dividerLine} />
							</View>
						);
					}

					return <MessageCard item={item.message} />;
				}}
				showsVerticalScrollIndicator={false}
				testID="MessageList"
			/>
		);
	},
);

export default MessageList;
