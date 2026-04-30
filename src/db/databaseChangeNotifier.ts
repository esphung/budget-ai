type DatabaseTable = 'transactions' | 'accounts';

type Listener = () => void;

const listenersByTable = new Map<DatabaseTable, Set<Listener>>();

function getListeners(table: DatabaseTable): Set<Listener> {
	let listeners = listenersByTable.get(table);

	if (!listeners) {
		listeners = new Set<Listener>();
		listenersByTable.set(table, listeners);
	}

	return listeners;
}

export function subscribeToTableChanges(
	table: DatabaseTable,
	listener: Listener,
): () => void {
	const listeners = getListeners(table);
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}

export function notifyTableChanged(table: DatabaseTable): void {
	getListeners(table).forEach((listener) => listener());
}
