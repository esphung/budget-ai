import React from 'react';
import { render } from '@testing-library/react-native';
import Panel from './Panel';
import { View, Text } from 'react-native';

const testID = 'panel-test-id';

describe('Panel', () => {
	it('renders children correctly', () => {
		const { getByText } = render(
			<Panel type="center" testID={testID}>
				<Text>Test Content</Text>
			</Panel>,
		);

		expect(getByText('Test Content')).toBeVisible();
	});

	it('applies the correct type styles', () => {
		const { getByTestId } = render(
			<Panel
				type="north"
				style={{ backgroundColor: 'red' }}
				testID={testID}
			/>,
		);

		const panel = getByTestId(testID);
		expect(panel.props.style).toEqual(
			expect.objectContaining({ backgroundColor: 'red' }),
		);
	});

	it('shows border when showBorder is true', () => {
		const { getByTestId } = render(
			<Panel type="south" showBorder testID={testID}>
				<View />
			</Panel>,
		);

		const panel = getByTestId(testID);
		expect(panel.props.style).toEqual(
			expect.objectContaining({ borderWidth: 1 }),
		);
	});

	it('does not show border when showBorder is false', () => {
		const { getByTestId } = render(
			<Panel type="south">
				<View testID={testID} />
			</Panel>,
		);

		const panel = getByTestId(testID);
		expect(panel.props.style).not.toEqual(
			expect.objectContaining({ borderWidth: 1 }),
		);
	});
});
