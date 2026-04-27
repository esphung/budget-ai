import React from 'react';
import { View, Text } from 'react-native';
import { AIMessage } from '@db/types';

const MessageCard = ({ item }: { item: AIMessage }) => {
	const isUser = item.role === 'user';
	return (
		<View
			style={{
				marginBottom: 12,
				alignSelf: isUser ? 'flex-end' : 'flex-start',
				backgroundColor: isUser ? '#007AFF' : '#E5E5EA',
				padding: 12,
				borderRadius: 16,
				maxWidth: '75%',
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.2,
				shadowRadius: 1.41,
				elevation: 2,
			}}>
			<Text style={{ color: isUser ? '#FFFFFF' : '#000000' }}>
				{item.content}
			</Text>
		</View>
	);
};

export default MessageCard;
