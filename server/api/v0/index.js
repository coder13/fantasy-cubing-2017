'use strict';

module.exports.register = function(server, options, next) {
	server.log('info', 'Setting up api...');
	server.route(require('./users'));

	next();
};

module.exports.register.attributes = {
	pkg: {
		name: 'api',
		version: '0'
	}
};
