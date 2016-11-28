'use strict';
const moment = require('moment');

module.exports.register = function(server, options, next) {
	server.log('info', 'Setting up api...');
	server.route(require('./points'));
	server.route(require('./teams'));
	server.route(require('./matchups'));
	server.route(require('./search'));

	server.route({
		method: 'GET',
		path: '/api/v0/times',
		config: {
			handler: function (request, reply) {
				reply({
					week: moment().week(),
					weekend: moment().day(5).hour(8).minute(0).second(0).milliseconds(0).unix()
				});
			}
		}
	});
	// server.route(require('./users'));

	next();
};

module.exports.register.attributes = {
	pkg: {
		name: 'api',
		version: '0'
	}
};
