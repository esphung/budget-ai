import { StyleSheet } from 'react-native';

export default StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
	},
	scrollContent: {
		alignItems: 'center',
		justifyContent: 'center',
		gap: 20,
		paddingHorizontal: 20,
		paddingVertical: 40,
	},
	content: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 20,
		paddingHorizontal: 20,
	},
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
	amountNegative: {
		color: '#d32f2f',
	},
	amountPositive: {
		color: '#2e7d32',
	},
	insightCard: {
		width: '100%',
		backgroundColor: '#fff8e1',
		borderWidth: 1,
		borderColor: '#f9a825',
		borderRadius: 6,
		padding: 14,
		gap: 6,
	},
	insightTitle: {
		fontSize: 14,
		fontWeight: '700',
		color: '#e65100',
	},
	insightText: {
		fontSize: 14,
		lineHeight: 20,
		color: '#333',
	},
	text: {
		fontSize: 18,
		marginBottom: 20,
	},
	button: {
		padding: 10,
		backgroundColor: '#007AFF',
		borderRadius: 5,
		width: 150,
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
	},
	buttonDisabled: {
		backgroundColor: '#ccc',
	},
	buttonContainer: {
		flexDirection: 'row',
		gap: 20,
	},
	linkTokenText: {
		fontSize: 12,
		color: '#555',
	},
});
