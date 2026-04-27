module.exports = {
	root: true,
	extends: '@react-native',
	ignorePatterns: ['coverage/'],
	rules: {
		// TODO: Remove these when closer to mvp
		'react-native/no-inline-styles': 'off',
	},
};
