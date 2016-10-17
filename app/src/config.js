const baseConfig = {
	apiURL: '/api/v0',
	serverUrl: 'http://localhost:8000'
};

const locationConfig = {
	'localhost': {
		serverUrl: 'http://localhost:8000'
	},
	'fantasycubing.surge.sh': {
		server: 'http://localhost:8000'
	}
};

module.exports = Object.assign({}, baseConfig, locationConfig[window.location.hostname]);
