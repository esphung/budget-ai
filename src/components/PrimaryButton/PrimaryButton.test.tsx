import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrimaryButton from './PrimaryButton';

describe('PrimaryButton', () => {
	it('renders with the correct title', () => {
		const { getByText } = render(
			<PrimaryButton title="Click Me" onPress={jest.fn()} />,
		);

		expect(getByText('Click Me')).toBeTruthy();
	});

	it('calls onPress when clicked', () => {
		const onPressMock = jest.fn();
		const { getByText } = render(
			<PrimaryButton title="Click Me" onPress={onPressMock} />,
		);

		fireEvent.press(getByText('Click Me'));
		expect(onPressMock).toHaveBeenCalledTimes(1);
	});

	it('applies the correct width', () => {
		const { getByTestId } = render(
			<PrimaryButton
				title="Click Me"
				onPress={jest.fn()}
				width={300}
				testID="primary-button"
			/>,
		);

		const button = getByTestId('primary-button');
		expect(button.props.style).toEqual(
			expect.objectContaining({ width: 300 }),
		);
	});

	it('uses default width when none is provided', () => {
		const { getByTestId } = render(
			<PrimaryButton
				title="Click Me"
				onPress={jest.fn()}
				testID="primary-button"
			/>,
		);

		const button = getByTestId('primary-button');
		expect(button.props.style).toEqual(
			expect.objectContaining({ width: 200 }),
		);
	});
});
