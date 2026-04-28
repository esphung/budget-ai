jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
	return jest.fn().mockImplementation(() => ({
		addListener: jest.fn(),
		removeListeners: jest.fn(),
		removeAllListeners: jest.fn(),
		removeSubscription: jest.fn(),
	}));
});

jest.mock('react-native-safe-area-context', () => {
	const React = require('react');
	const inset = { top: 0, bottom: 0, left: 0, right: 0 };
	const frame = { x: 0, y: 0, width: 320, height: 640 };

	return {
		__esModule: true,
		useSafeAreaInsets: () => inset,
		useSafeAreaFrame: () => frame,
		SafeAreaProvider: ({ children }: { children: unknown }) => children,
		SafeAreaConsumer: ({
			children,
		}: {
			children: (value: typeof inset) => unknown;
		}) => children(inset),
		SafeAreaView: ({ children }: { children: unknown }) => children,
		SafeAreaInsetsContext: React.createContext(inset),
		SafeAreaFrameContext: React.createContext(frame),
		initialWindowMetrics: {
			insets: inset,
			frame,
		},
	};
});
