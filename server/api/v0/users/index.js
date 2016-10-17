'use strict';

const Boom = require('boom');
const handlers = require('./handlers');
const User = App.models.User;

const base = '/api/v0';

module.exports = [{
	method: 'GET',
	path: `${base}/users`,
	config: {
		auth: 'session',
		pre: [{method: User.role('Admin').bind(User)}],
		handler: handlers.getAll
	}
}];
