module.exports = {
	root: true,
	extends: '@react-native',
	ignorePatterns: ['coverage/', 'node_modules/', 'dist/'],
	rules: {
		// TODO: Remove these when closer to mvp
		'react-native/no-inline-styles': 'off',
	},
};
