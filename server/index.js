'use strict';

const DEV = process.env.NODE_ENV === 'dev';
console.log('DEV: ' + DEV);

const app = require('ampersand-app');
const fs = require('fs');
const path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');
const shortId = require('shortid');
const config = require('./serverconfig.js');

const plugins = [{
	register: require('good'),
	options: {
		ops: {
			interval: 1000,
			utc: false,
			format: 'YYYY-MM-DDThh:mm:ss'
		},
		reporters: {
			consoleReporter: [{
				module: 'good-squeeze',
				name: 'Squeeze',
				args: [{ log: '*', response: '*', 'sql': '*'}]
			}, {
				module: 'good-console'
			}, 'stdout']
		}
	}
}, {
	register: require('hapi-cors'),
	options: {
		methods: ['POST, GET, OPTIONS, PUT, DELETE'],
		origins: ['*'],
		allowCredentials: 'true'
	}
},
	require('inert'),
	require('hapi-auth-cookie'),
	require('bell'),
	require('./auth'),
	require('./api')
];

if (DEV) {
	plugins.push({
		register: require('h2o2')
	});
}

const App = global.App = app.extend({
	init: function () {
		App.config = config;

		let server = this.server = new Hapi.Server({
			debug: {
				request: ['error']
			},
			connections: {
				routes: {
					files: {
						relativeTo: path.join(__dirname, '../app/public')
					}
				}
			}
		});

		// Configure connection
		server.connection({
			port: config.port
		});

		// Database
		this.db = require('./models/');

		// this.db.sequelize.logging = (str) => server.log('info', 'str');
		// console.log(78, this.db.sequelize.logging)

		server.register(plugins, function (err) {
			if (err) {
				server.log('error', err);
			}

			const tryAuth = {
				strategy: 'session',
				mode: 'optional'
			};

			// Should go into seperate files:
			if (DEV) {
				// note: if not hot loading, make sure nodemon isn't watching the app directory
				server.log('info', 'Setting up proxy...');
				server.route({
					method: 'GET',
					path: '/{path*}',
					config: {
						auth: tryAuth,
						plugins: {
							'hapi-auth-cookie': {
								redirectTo: false
							}
						},
						handler: {
							proxy: {
								host: 'localhost',
								port: '3000',
								protocol: 'http',
								passThrough: true
							}
						}
					}
				});
			} else {
				server.route({
					method: 'GET',
					path: '/{path*}',
					handler: {
						directory: {
							path: '.',
							index: true,
							listing: false,
							showHidden: false
						}
					}
				});

				server.ext('onPostHandler', function (request, reply) {
					const response = request.response;
					if (response.isBoom && response.output.statusCode === 404) {
						return reply.file('404.html', {
							filename: request.path
						});
					}

					return reply.continue();
				});
			}

			App.start();
		});
	},

	start: function () {
		App.server.start(function (err) {
			Hoek.assert(!err, 'Failed to start server: ' + err);

			App.server.log('info', `Server running at: ${App.server.info.uri}`);
		});
	}
});

app.init();
