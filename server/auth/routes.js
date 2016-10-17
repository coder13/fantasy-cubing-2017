'use strict';
const handlers = require('./handlers');

module.exports = [{
	path: '/login',
	method: ['GET', 'POST'],
	config: {
		auth: 'wca',
		cors: true,
		handler: handlers.login
	}
}, {
	path: '/logout',
	method: 'GET',
	config: {
		handler: handlers.logout
	}
}, {
	path: '/api/v0/me',
	method: 'GET',
	config: {
		auth: {
			strategy: 'session',
			mode: 'try'
		},
		handler: handlers.profile
	}
}];
