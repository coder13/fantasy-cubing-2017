'use strict';

const app = require('ampersand-app');
const Users = require('./users');

module.exports.register = function(server, options, next) {
	server.log('Setting up auth...');

	if (!app.config.secrets.CLIENT_ID || !app.config.secrets.CLIENT_SECRET) {
		throw new Error('Enviroment variables CLIENT_ID and/or CLIENT_SECRET not defined.');
	}

	console.log(`CLIENT_ID: ${app.config.secrets.CLIENT_ID}`);
	console.log(`CLIENT_SECRET: ${app.config.secrets.CLIENT_SECRET}`);

	// Setup the social WCA login strategy
	server.auth.strategy('wca', 'bell', {
		provider: {
			name: 'wca',
			useParamsAuth: true,
			protocol: 'oauth2',
			auth: 'https://www.worldcubeassociation.org/oauth/authorize',
			token: 'https://www.worldcubeassociation.org/oauth/token',
			scope: ['email', 'public'],
			scopeSeparator: ' ',
			profile: function (credentials, params, get, callback) {
				get('https://www.worldcubeassociation.org/api/v0/me', null, function (resp) {
					credentials.profile = resp.me;
					callback();
				});
			}
		},
		password: 'secret_cookie_encryption_password', //Use something more secure in production
		clientId: app.config.secrets.CLIENT_ID,
		clientSecret: app.config.secrets.CLIENT_SECRET,
		isSecure: false //Should be set to true (which is the default) in production
	});

	//Setup the session strategy
	server.auth.strategy('session', 'cookie', {
		password: 'secret_cookie_encryption_password', //Use something more secure in production
		cookie: 'sid-fantasycubing',
		redirectTo: '/', //If there is no session, redirect here
		isSecure: false //Should be set to true (which is the default) in production,
	});

	//Added a separate file for just routes.
	server.route(require('./routes'));
	next();
};

module.exports.register.attributes = {
	pkg: {
		name: 'auth',
		version: '0'
	}
};
