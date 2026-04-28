import ActionButtonList, {
	ActionButtonItem,
} from '@components/ActionButtonList/ActionButtonList';
import { fireEvent, render } from '@testing-library/react-native';

describe('ActionButtonList', () => {
	const items: ActionButtonItem[] = [
		{
			id: 'first',
			title: 'First Action',
			type: 'primary',
			testID: 'action-first',
		},
		{
			id: 'second',
			title: 'Second Action',
			type: 'secondary',
			testID: 'action-second',
		},
		{
			id: 'third',
			title: 'Third Action',
			type: 'tertiary',
			testID: 'action-third',
		},
	];

	it('renders all action buttons', () => {
		const onPressItem = jest.fn();
		const { getByText } = render(
			<ActionButtonList items={items} onPressItem={onPressItem} />,
		);

		expect(getByText('First Action')).toBeTruthy();
		expect(getByText('Second Action')).toBeTruthy();
		expect(getByText('Third Action')).toBeTruthy();
	});

	it('calls onPressItem with item id when pressed', () => {
		const onPressItem = jest.fn();
		const { getByTestId } = render(
			<ActionButtonList items={items} onPressItem={onPressItem} />,
		);

		fireEvent.press(getByTestId('action-second'));

		expect(onPressItem).toHaveBeenCalledWith('second');
	});
});
