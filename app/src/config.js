const baseConfig = {
	apiURL: '/api/v0',
	// apiURL: 'http://104.236.111.52:8000/api/v0',
	serverUrl: 'http://localhost:8000'
};

const locationConfig = {
	'localhost': {
		serverUrl: 'http://localhost:8000'
	}
};

module.exports = Object.assign({}, baseConfig, locationConfig[window.location.hostname]);
