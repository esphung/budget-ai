import { View, Text } from 'react-native';

const LoadingView = ({ message }: { message: string }) => (
	<View
		style={{
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		}}>
		<Text style={{ marginTop: 8 }}>{message}</Text>
	</View>
);

export default LoadingView;
