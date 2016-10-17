const webpack = require('webpack');

// Return different config based off of NODE_ENV;
const baseConfig = {
	host: 'localhost',
	port: '8000',
	router: {
		stripTrailingSlash: true
	},
	db: {
		url: '',
		settings: {
			db: {
				native_parser: false
			}
		}
	},
	secrets: require('../secrets')
};

const config = {
	dev: {
	},
	prod: {

	}
};

module.exports = Object.assign({}, baseConfig, config[process.env.NODE_ENV || 'dev']);
