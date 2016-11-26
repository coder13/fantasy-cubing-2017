'use strict';

const Boom = require('boom');
const handlers = require('./handlers');
const User = App.db.User;

const base = '/api/v0';

module.exports = [{
	method: 'GET',
	path: `${base}/users`,
	config: {
		auth: 'session',
		handler: handlers.getAll
	}
}];
