import { TestID } from '@enums/TestID';
import AppStack from '@navigation/AppStack/AppStack';
import type { ApiClient } from '@services/ApiClient';
import { render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@screens/TestScreen/TestScreen', () => {
	const ids = require('@enums/TestID');
	const RN = require('react-native');

	return function MockTestScreen() {
		return <RN.View testID={ids.TestID.TestScreen} />;
	};
});

describe('AppStack', () => {
	it('renders TestScreen', () => {
		const apiClient = {} as ApiClient;
		const { getByTestId } = render(<AppStack apiClient={apiClient} />);
		const testScreen = getByTestId(TestID.TestScreen);
		expect(testScreen).toBeVisible();
	});

	it('renders AppStack container with correct styles', () => {
		const apiClient = {} as ApiClient;
		const { getByTestId } = render(<AppStack apiClient={apiClient} />);
		const container = getByTestId(TestID.AppStack);
		expect(container).toHaveStyle({
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		});
	});
});
