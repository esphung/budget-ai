import { consoleTransport, logger } from 'react-native-logs';

const log = logger.createLogger({
	transport: consoleTransport,
	transportOptions: {
		extensionColors: {
			dbLog: 'magentaBright',
			flagsLog: 'cyanBright',
			homeScreenLog: 'greenBright',
			chatLog: 'blueBright',
		},
	},
	printLevel: false,
	printDate: false,
	enabled: __DEV__,
	enabledExtensions: ['dbLog', 'flagsLog', 'homeScreenLog', 'chatLog'],
});

export const dbLog = log.extend('dbLog');
export const flagsLog = log.extend('flagsLog');
export const homeScreenLog = log.extend('homeScreenLog');
export const chatLog = log.extend('chatLog');
