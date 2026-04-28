let nodeTag = 1;
let animationId = 1;

const NativeAnimatedHelper = {
	API: {
		createAnimatedNode: jest.fn(),
		updateAnimatedNodeConfig: jest.fn(),
		startListeningToAnimatedNodeValue: jest.fn(),
		stopListeningToAnimatedNodeValue: jest.fn(),
		connectAnimatedNodes: jest.fn(),
		disconnectAnimatedNodes: jest.fn(),
		startAnimatingNode: jest.fn(),
		stopAnimation: jest.fn(),
		setAnimatedNodeValue: jest.fn(),
		setAnimatedNodeOffset: jest.fn(),
		flattenAnimatedNodeOffset: jest.fn(),
		extractAnimatedNodeOffset: jest.fn(),
		connectAnimatedNodeToView: jest.fn(),
		connectAnimatedNodeToShadowNodeFamily: jest.fn(),
		disconnectAnimatedNodeFromView: jest.fn(),
		restoreDefaultValues: jest.fn(),
		dropAnimatedNode: jest.fn(),
		addAnimatedEventToView: jest.fn(),
		removeAnimatedEventFromView: jest.fn(),
		setWaitingForIdentifier: jest.fn(),
		unsetWaitingForIdentifier: jest.fn(),
		flushQueue: jest.fn(),
	},
	nativeEventEmitter: {
		addListener: jest.fn(() => ({ remove: jest.fn() })),
		removeAllListeners: jest.fn(),
	},
	assertNativeAnimatedModule: jest.fn(),
	shouldUseNativeDriver: jest.fn(() => false),
	generateNewNodeTag: jest.fn(() => nodeTag++),
	generateNewAnimationId: jest.fn(() => animationId++),
	transformDataType: jest.fn((value) => value),
	shouldSignalBatch: false,
};

export default NativeAnimatedHelper;
