module.exports = {
	presets: ['module:@react-native/babel-preset'],

	// alias for absolute imports
	plugins: [
		[
			'module-resolver',
			{
				root: ['./src'],
				extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
				alias: {
					'@components': './src/components',
					'@screens': './src/screens',
					'@assets': './src/assets',
					'@utils': './src/utils',
					'@hooks': './src/hooks',
					'@services': './src/services',
					'@models': './src/models',
					'@context': './src/context',
					'@navigation': './src/navigation',
					'@theme': './src/theme',
					'@enums': './src/enums',
					'@stores': './src/stores',
					'@providers': './src/providers',
					'@mocks': './src/mocks',
					'@repositories': './src/repositories',
					'@db': './src/db',
				},
			},
		],
	],
};
