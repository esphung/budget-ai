import { useCallback, useEffect, useRef } from 'react';
import { Animated, Keyboard, Platform } from 'react-native';

type UseKeyboardShiftOptions = {
	keyboardOffset?: number;
	defaultDurationMs?: number;
};

const toDurationMs = (duration?: number, fallback = 220) => {
	if (typeof duration !== 'number') {
		return fallback;
	}

	return duration < 10
		? Math.round(duration * 1000)
		: Math.round(duration);
};

const useKeyboardShift = ({
	keyboardOffset = 0,
	defaultDurationMs = 220,
}: UseKeyboardShiftOptions = {}) => {
	const keyboardShift = useRef(new Animated.Value(0)).current;

	const animateKeyboardShift = useCallback(
		(keyboardHeight: number, duration?: number) => {
			const offset = Math.max(0, keyboardHeight - keyboardOffset);
			Animated.timing(keyboardShift, {
				toValue: -offset,
				duration: toDurationMs(duration, defaultDurationMs),
				useNativeDriver: true,
			}).start();
		},
		[keyboardOffset, keyboardShift, defaultDurationMs],
	);

	useEffect(() => {
		const showEvent =
			Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
		const hideEvent =
			Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

		const showSubscription = Keyboard.addListener(
			showEvent,
			(event) => {
				animateKeyboardShift(
					event.endCoordinates?.height ?? 0,
					event.duration,
				);
			},
		);
		const hideSubscription = Keyboard.addListener(
			hideEvent,
			(event) => {
				animateKeyboardShift(0, event.duration);
			},
		);

		return () => {
			showSubscription?.remove?.();
			hideSubscription?.remove?.();
		};
	}, [animateKeyboardShift]);

	const dismissKeyboardOnTouchCapture = useCallback(() => {
		Keyboard.dismiss();
		return false;
	}, []);

	return {
		keyboardShift,
		dismissKeyboardOnTouchCapture,
	};
};

export default useKeyboardShift;
