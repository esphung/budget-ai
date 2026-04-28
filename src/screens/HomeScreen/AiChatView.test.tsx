import AiChatView from '@screens/HomeScreen/AiChatView';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Keyboard } from 'react-native';

const mockSendMessageAndApplyActions = jest.fn();
const mockCheckHealth = jest.fn();
const mockUseBackendHealth = jest.fn();
const mockKeyboardDismiss = jest.fn();

jest.mock('@components/AppText/AppText', () => {
	const { Text } = require('react-native');
	return ({ children, ...props }: any) => (
		<Text {...props}>{children}</Text>
	);
});

jest.mock('@components/Chat/MessageList', () => {
	const { Text } = require('react-native');
	return ({ messages }: { messages: unknown[] }) => (
		<Text>{`messages:${messages.length}`}</Text>
	);
});

jest.mock('@components/LoadingView/LoadingView', () => {
	const { Text } = require('react-native');
	return ({ message }: { message: string }) => <Text>{message}</Text>;
});

jest.mock('@components/PrimaryButton', () => {
	const { Text, TouchableOpacity } = require('react-native');
	return ({ title, onPress }: { title: string; onPress: () => void }) => (
		<TouchableOpacity onPress={onPress} accessibilityRole="button">
			<Text>{title}</Text>
		</TouchableOpacity>
	);
});

jest.mock('@hooks/useBackendHealth', () => ({
	useBackendHealth: (...args: unknown[]) => mockUseBackendHealth(...args),
}));

jest.mock('@providers/ApiClientProvider', () => ({
	useApiClient: (selector?: (api: any) => unknown) => {
		const api = {
			health: {
				check: mockCheckHealth,
			},
		};

		return selector ? selector(api) : { api };
	},
}));

jest.mock('@providers/OpenAiServiceProvider', () => ({
	useOpenAiService: () => ({
		aiService: {
			sendMessageAndApplyActions: mockSendMessageAndApplyActions,
		},
	}),
}));

jest.mock('@providers/ThemeProvider', () => ({
	useTheme: () => ({
		colors: {
			neutral: {
				placeholder: '#94A3B8',
				border: '#CBD5E1',
				surface: '#FFFFFF',
				text: '#0F172A',
				textSecondary: '#475569',
			},
			success: '#15803D',
			error: '#B91C1C',
			warning: '#C2410C',
		},
	}),
}));

describe('AiChatView', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(Keyboard, 'dismiss').mockImplementation(
			mockKeyboardDismiss,
		);
		jest.spyOn(Keyboard, 'addListener').mockReturnValue({
			remove: jest.fn(),
		} as any);
		mockUseBackendHealth.mockReturnValue({
			backendStatus: 'online',
			isBackendOnline: true,
			refreshHealth: jest.fn(),
		});
	});

	it('shows the offline indicator when the backend is unavailable', () => {
		mockUseBackendHealth.mockReturnValue({
			backendStatus: 'offline',
			isBackendOnline: false,
			refreshHealth: jest.fn(),
		});

		const { getByText } = render(
			<AiChatView threadId="thread-1" messages={[]} />,
		);

		expect(getByText('AI temporarily unavailable')).toBeTruthy();
	});

	it('sends chat messages when the backend is online', async () => {
		const { getByPlaceholderText, getByText } = render(
			<AiChatView threadId="thread-1" messages={[]} />,
		);

		fireEvent.changeText(
			getByPlaceholderText('Type your message...'),
			'Log my lunch expense',
		);
		fireEvent.press(getByText('Send'));

		await waitFor(() => {
			expect(mockSendMessageAndApplyActions).toHaveBeenCalledWith({
				threadId: 'thread-1',
				userText: 'Log my lunch expense',
			});
		});

		expect(mockKeyboardDismiss).toHaveBeenCalled();
	});

	it('does not send chat messages when the backend is offline', async () => {
		mockUseBackendHealth.mockReturnValue({
			backendStatus: 'offline',
			isBackendOnline: false,
			refreshHealth: jest.fn(),
		});

		const { getByPlaceholderText, getByText } = render(
			<AiChatView threadId="thread-1" messages={[]} />,
		);

		fireEvent.changeText(
			getByPlaceholderText('Type your message...'),
			'Log my lunch expense',
		);
		fireEvent.press(getByText('Send'));

		await waitFor(() => {
			expect(mockSendMessageAndApplyActions).not.toHaveBeenCalled();
		});
	});

	it('dismisses keyboard when tapping away from the input', () => {
		const { getByTestId } = render(
			<AiChatView threadId="thread-1" messages={[]} />,
		);

		fireEvent(
			getByTestId('AiChatView-Container'),
			'startShouldSetResponderCapture',
		);

		expect(mockKeyboardDismiss).toHaveBeenCalled();
	});
});
