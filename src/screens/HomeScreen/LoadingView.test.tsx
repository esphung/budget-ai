import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingView from './LoadingView';

describe('LoadingView', () => {
	test('renders correctly with a message', () => {
		const message = 'Loading...';
		const { getByText } = render(<LoadingView message={message} />);

		// Check if the message is displayed
		expect(getByText(message)).toBeTruthy();
	});
});
