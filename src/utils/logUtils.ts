import { consoleTransport, logger } from 'react-native-logs';

const log = logger.createLogger({
	transport: consoleTransport,
	transportOptions: {
		extensionColors: {
			dbLog: 'magentaBright',
			flagsLog: 'cyanBright',
			homeScreenLog: 'greenBright',
			chatLog: 'blueBright',
			healthCheckLog: 'yellowBright',
			repositoryLog: 'redBright',
			aiLog: 'whiteBright',
		},
	},
	printLevel: false,
	printDate: false,
	enabled: __DEV__,
	enabledExtensions: [
		'dbLog',
		'flagsLog',
		'homeScreenLog',
		'chatLog',
		'healthCheckLog',
		'repositoryLog',
		'aiLog',
	],
});

export const dbLog = log.extend('dbLog');
export const flagsLog = log.extend('flagsLog');
export const homeScreenLog = log.extend('homeScreenLog');
export const chatLog = log.extend('chatLog');
export const healthCheckLog = log.extend('healthCheckLog');
export const repositoryLog = log.extend('repositoryLog');
export const aiLog = log.extend('aiLog');
