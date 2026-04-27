import {
	FeatureFlagsProvider,
	useEvaluateFlag,
	useFeatureFlags,
} from '@providers/FeatureFlagsProvider';
import { act, renderHook } from '@testing-library/react-native';
import React from 'react';

describe('FeatureFlagsProvider', () => {
	it('provides initial flags and allows flag evaluation', () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<FeatureFlagsProvider initialFlags={{ isChatEnabled: true }}>
				{children}
			</FeatureFlagsProvider>
		);

		const { result } = renderHook(
			() => useEvaluateFlag('isChatEnabled'),
			{ wrapper },
		);

		expect(result.current).toBe(true);
	});

	it('allows setting a flag', () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<FeatureFlagsProvider initialFlags={{ isChatEnabled: false }}>
				{children}
			</FeatureFlagsProvider>
		);

		const { result } = renderHook(() => useFeatureFlags(), { wrapper });

		act(() => {
			result.current.setFlag('isChatEnabled', true);
		});

		expect(result.current.flags.isChatEnabled).toBe(true);
	});

	it('evaluates a flag that does not exist as false', () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<FeatureFlagsProvider>{children}</FeatureFlagsProvider>
		);

		const { result } = renderHook(
			() => useEvaluateFlag('nonExistentFlag'),
			{
				wrapper,
			},
		);

		expect(result.current).toBe(false);
	});
});
