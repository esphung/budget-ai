import { AIMessage } from '@db/types';
import React, { forwardRef } from 'react';
import { FlatList } from 'react-native';
import MessageCard from './MessageCard';

const MessageList = forwardRef<FlatList, { messages: AIMessage[] }>(
	({ messages }, ref) => {
		return (
			<FlatList
				ref={ref}
				data={[...messages]}
				keyExtractor={(item) => item.id}
				inverted
				renderItem={({ item }) => <MessageCard item={item} />}
			/>
		);
	},
);

export default MessageList;
