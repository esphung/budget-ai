jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
	return jest.fn().mockImplementation(() => ({
		addListener: jest.fn(),
		removeAllListeners: jest.fn(),
		removeSubscription: jest.fn(),
	}));
});

jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
	SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
		children,
}));

jest.mock('react-native-plaid-link-sdk', () => ({
	create: jest.fn(),
	LinkTokenConfiguration: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
	__esModule: true,
	default: {
		setItem: jest.fn().mockResolvedValue(undefined),
		getItem: jest.fn().mockResolvedValue(null),
		removeItem: jest.fn().mockResolvedValue(undefined),
	},
}));
