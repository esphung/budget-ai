import AppText from '@components/AppText/AppText';
import PrimaryButton from '@components/PrimaryButton';
import ThemedScreen from '@components/ThemedScreen/ThemedScreen';
import { useReactiveAccounts } from '@hooks/useReactiveAccounts';
import {
	AppStackParamList,
	AppStackScreens,
} from '@navigation/AppStack/AppStack';
import { useDatabase } from '@providers/DatabaseProvider';
import { useAuthStore } from '@providers/AuthProvider';
import { useTheme } from '@providers/ThemeProvider';
import { AccountRepository } from '@repositories/AccountRepository';
import { CategoryRepository } from '@repositories/CategoryRepository';
import { TransactionRepository } from '@repositories/TransactionRepository';
import { AppColors, radius, spacing, typography } from '@theme/tokens';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CreateManualTransaction } from '@usecases/createManualTransaction';
import { EnsureDefaultAccount } from '@usecases/ensureDefaultAccount';
import useKeyboardShift from '../../hooks/useKeyboardShift';
import { Category } from 'types/Category';
import {
	Animated,
	Keyboard,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';

type Props = NativeStackScreenProps<
	AppStackParamList,
	AppStackScreens.ManualTransaction,
	'AppStack'
>;

const toDateInputValue = (date = new Date()) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const ManualTransactionScreen = ({ navigation }: Props) => {
	const { db } = useDatabase();
	const { userId } = useAuthStore();
	const { colors, isDarkMode } = useTheme();
	const styles = useMemo(() => createStyles(colors), [colors]);
	const { keyboardShift, dismissKeyboardOnTouchCapture } =
		useKeyboardShift({
			keyboardOffset: Platform.OS === 'ios' ? 250 : 180,
		});

	const [amount, setAmount] = useState('');
	const [merchant, setMerchant] = useState('');
	const [category, setCategory] = useState('');
	const [date, setDate] = useState(toDateInputValue());
	const [transactionType, setTransactionType] = useState<
		'expense' | 'income' | 'transfer'
	>('expense');
	const [selectedAccountId, setSelectedAccountId] = useState<
		string | null
	>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const accounts = useReactiveAccounts(db);

	useEffect(() => {
		if (!db) {
			return;
		}

		const ensureDefaultAccount = async () => {
			const useCase = new EnsureDefaultAccount(
				new AccountRepository(db, userId),
			);
			await useCase.execute();
		};

		ensureDefaultAccount().catch((error) => {
			console.error('Failed to load accounts', error);
			setErrorMessage('Unable to load accounts.');
		});
	}, [db, userId]);

	useEffect(() => {
		if (!db) {
			setCategories([]);
			return;
		}

		const loadCategories = async () => {
			try {
				const loadedCategories = await new CategoryRepository(
					db,
					userId,
				).list();
				setCategories(loadedCategories);
			} catch (error) {
				console.error('Failed to load categories', error);
			}
		};

		loadCategories();
	}, [db, userId]);

	useEffect(() => {
		if (!accounts.length) {
			setSelectedAccountId(null);
			return;
		}

		setSelectedAccountId((currentAccountId) => {
			if (
				currentAccountId &&
				accounts.some((account) => account.id === currentAccountId)
			) {
				return currentAccountId;
			}

			return accounts[0].id;
		});
	}, [accounts]);

	const saveManualTransaction = useCallback(async () => {
		if (!db || isSaving) {
			return;
		}

		setErrorMessage(null);

		setIsSaving(true);
		try {
			const normalizedCategory = category.trim();
			if (normalizedCategory) {
				const categoryRepo = new CategoryRepository(db, userId);
				const hasCategory = (await categoryRepo.list()).some(
					(existingCategory) =>
						existingCategory.name.toLowerCase() ===
						normalizedCategory.toLowerCase(),
				);

				if (!hasCategory) {
					await categoryRepo.create({
						name: normalizedCategory,
					});
				}
			}

			const useCase = new CreateManualTransaction(
				new TransactionRepository(db, userId),
			);
			const result = await useCase.execute({
				amount,
				merchant,
				category: normalizedCategory,
				date,
				accountId: selectedAccountId,
				transactionType,
			});

			if (!result.success) {
				setErrorMessage(
					result.error ??
						'Unable to save transaction. Try again.',
				);
				return;
			}

			navigation.goBack();
		} catch (error) {
			console.error('Failed to save transaction', error);
			setErrorMessage('Unable to save transaction. Try again.');
		} finally {
			setIsSaving(false);
		}
	}, [
		amount,
		category,
		date,
		db,
		isSaving,
		merchant,
		navigation,
		selectedAccountId,
		transactionType,
		userId,
	]);

	if (!db) {
		return (
			<ThemedScreen>
				<View style={styles.centeredMessageContainer}>
					<AppText>Database is not ready.</AppText>
				</View>
			</ThemedScreen>
		);
	}

	return (
		<ThemedScreen>
			<Animated.View
				style={[
					styles.flex,
					{ transform: [{ translateY: keyboardShift }] },
				]}
				onStartShouldSetResponderCapture={
					dismissKeyboardOnTouchCapture
				}>
				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled">
					<AppText variant="title" style={styles.title}>
						Add Manual Transaction
					</AppText>

					<AppText style={styles.label}>Account</AppText>
					<View style={styles.accountList}>
						{accounts.map((account) => {
							const isSelected =
								selectedAccountId === account.id;
							return (
								<Pressable
									key={account.id}
									onPress={() =>
										setSelectedAccountId(account.id)
									}
									style={[
										styles.accountChip,
										isSelected &&
											styles.accountChipSelected,
									]}>
									<AppText
										style={[
											styles.accountChipText,
											isSelected &&
												styles.accountChipTextSelected,
										]}>
										{account.name}
									</AppText>
								</Pressable>
							);
						})}
					</View>

					<AppText style={styles.label}>Amount</AppText>
					<TextInput
						value={amount}
						onChangeText={setAmount}
						placeholder="0.00"
						keyboardType="decimal-pad"
						onSubmitEditing={Keyboard.dismiss}
						blurOnSubmit={true}
						placeholderTextColor={colors.neutral.placeholder}
						style={styles.input}
						keyboardAppearance={isDarkMode ? 'dark' : 'light'}
					/>

					<AppText style={styles.label}>Merchant</AppText>
					<TextInput
						value={merchant}
						onChangeText={setMerchant}
						placeholder="Optional"
						onSubmitEditing={Keyboard.dismiss}
						blurOnSubmit={true}
						placeholderTextColor={colors.neutral.placeholder}
						style={styles.input}
						keyboardAppearance={isDarkMode ? 'dark' : 'light'}
					/>

					<AppText style={styles.label}>Category</AppText>
					<TextInput
						value={category}
						onChangeText={setCategory}
						placeholder="Optional"
						onSubmitEditing={Keyboard.dismiss}
						blurOnSubmit={true}
						placeholderTextColor={colors.neutral.placeholder}
						style={styles.input}
						keyboardAppearance={isDarkMode ? 'dark' : 'light'}
					/>

					{categories.length ? (
						<>
							<AppText style={styles.categorySuggestionLabel}>
								Suggestions
							</AppText>
							<View style={styles.categoryList}>
								{categories.map((categoryItem) => {
									const isSelected =
										category.trim().toLowerCase() ===
										categoryItem.name.toLowerCase();

									return (
										<Pressable
											key={categoryItem.id}
											onPress={() => {
												setCategory(
													categoryItem.name,
												);
											}}
											style={[
												styles.categoryChip,
												isSelected &&
													styles.categoryChipSelected,
											]}>
											<AppText
												style={[
													styles.categoryChipText,
													isSelected &&
														styles.categoryChipTextSelected,
												]}>
												{categoryItem.name}
											</AppText>
										</Pressable>
									);
								})}
							</View>
						</>
					) : null}

					<AppText style={styles.label}>Date</AppText>
					<TextInput
						value={date}
						onChangeText={setDate}
						placeholder="YYYY-MM-DD"
						onSubmitEditing={Keyboard.dismiss}
						blurOnSubmit={true}
						autoCapitalize="none"
						autoCorrect={false}
						placeholderTextColor={colors.neutral.placeholder}
						style={styles.input}
						keyboardAppearance={isDarkMode ? 'dark' : 'light'}
					/>

					<AppText style={styles.label}>Type</AppText>
					<View style={styles.typeToggleRow}>
						{(['expense', 'income', 'transfer'] as const).map(
							(type) => {
								const isSelected = transactionType === type;
								return (
									<Pressable
										key={type}
										onPress={() =>
											setTransactionType(type)
										}
										style={[
											styles.typeToggle,
											isSelected &&
												styles.typeToggleSelected,
										]}>
										<AppText
											style={[
												styles.typeToggleText,
												isSelected &&
													styles.typeToggleTextSelected,
											]}>
											{type.charAt(0).toUpperCase() +
												type.slice(1)}
										</AppText>
									</Pressable>
								);
							},
						)}
					</View>

					{errorMessage && (
						<AppText
							color={colors.error}
							style={styles.errorText}>
							{errorMessage}
						</AppText>
					)}

					<View style={styles.buttonRow}>
						<PrimaryButton
							title="Cancel"
							type="secondary"
							width="48%"
							onPress={() => navigation.goBack()}
						/>
						<PrimaryButton
							title={isSaving ? 'Saving...' : 'Save'}
							width="48%"
							onPress={saveManualTransaction}
						/>
					</View>
				</ScrollView>
			</Animated.View>
		</ThemedScreen>
	);
};

const createStyles = (colors: AppColors) =>
	StyleSheet.create({
		flex: {
			flex: 1,
		},
		content: {
			paddingHorizontal: spacing.lg,
			paddingVertical: spacing.lg,
			gap: spacing.sm,
		},
		title: {
			marginBottom: spacing.md,
		},
		label: {
			...typography.small,
			color: colors.neutral.textSecondary,
			marginTop: spacing.xs,
		},
		input: {
			borderWidth: 1,
			borderColor: colors.neutral.border,
			paddingHorizontal: spacing.lg - 2,
			paddingVertical: spacing.md,
			borderRadius: radius.md,
			backgroundColor: colors.neutral.surface,
			color: colors.neutral.text,
		},
		typeToggleRow: {
			flexDirection: 'row',
			gap: spacing.sm,
		},
		typeToggle: {
			flex: 1,
			paddingVertical: spacing.sm,
			borderRadius: radius.md,
			borderWidth: 1,
			borderColor: colors.neutral.border,
			backgroundColor: colors.neutral.surface,
			alignItems: 'center',
		},
		typeToggleSelected: {
			borderColor: colors.primary.base,
			backgroundColor: colors.primary.base,
		},
		typeToggleText: {
			...typography.small,
			color: colors.neutral.textSecondary,
		},
		typeToggleTextSelected: {
			color: colors.neutral.surface,
		},
		accountList: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: spacing.sm,
		},
		accountChip: {
			paddingHorizontal: spacing.md,
			paddingVertical: spacing.sm,
			borderRadius: radius.full,
			borderWidth: 1,
			borderColor: colors.neutral.border,
			backgroundColor: colors.neutral.surface,
		},
		accountChipSelected: {
			borderColor: colors.primary.base,
			backgroundColor: colors.primary.base,
		},
		accountChipText: {
			...typography.small,
			color: colors.neutral.textSecondary,
		},
		accountChipTextSelected: {
			color: colors.neutral.surface,
		},
		categorySuggestionLabel: {
			...typography.small,
			color: colors.neutral.textTertiary,
		},
		categoryList: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: spacing.sm,
		},
		categoryChip: {
			paddingHorizontal: spacing.md,
			paddingVertical: spacing.sm,
			borderRadius: radius.full,
			borderWidth: 1,
			borderColor: colors.neutral.border,
			backgroundColor: colors.neutral.surface,
		},
		categoryChipSelected: {
			borderColor: colors.primary.base,
			backgroundColor: colors.primary.base,
		},
		categoryChipText: {
			...typography.small,
			color: colors.neutral.textSecondary,
		},
		categoryChipTextSelected: {
			color: colors.neutral.surface,
		},
		errorText: {
			marginTop: spacing.xs,
		},
		buttonRow: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			marginTop: spacing.md,
		},
		centeredMessageContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		},
	});

export default ManualTransactionScreen;
