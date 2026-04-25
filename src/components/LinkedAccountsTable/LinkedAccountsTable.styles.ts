import { StyleSheet } from 'react-native';

export default StyleSheet.create({
	tableContainer: {
		width: '100%',
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 6,
		overflow: 'hidden',
	},
	tableTitle: {
		fontSize: 16,
		fontWeight: '600',
		padding: 10,
		backgroundColor: '#f0f0f0',
	},
	tableRow: {
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: '#ddd',
	},
	tableCell: {
		flex: 1,
		padding: 8,
		fontSize: 12,
	},
	tableCellWide: {
		flex: 1,
	},
	tableHeader: {
		fontWeight: '600',
		backgroundColor: '#f8f8f8',
	},
});
