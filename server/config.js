const webpack = require('webpack');
const secrets = require('../secrets');

// Return different config based off of NODE_ENV;
const baseConfig = {
	host: 'localhost',
	port: '8000',
	router: {
		stripTrailingSlash: true
	}
};

const config = {
	dev: {
	},
	prod: {

	}
};

module.exports = Object.assign(baseConfig, secrets, config[process.env.NODE_ENV || 'dev']);
