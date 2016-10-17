'use strict';

const DEV = process.env.NODE_ENV === 'dev';
console.log('DEV: ' + DEV);

const app = require('ampersand-app');
const fs = require('fs');
const path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');
const Sequelize = require('sequelize');
const config = require('./config');

const plugins = [{
	register: require('good'),
	options: {
		ops: {
			interval: 1000
		},
		reporters: {
			myConsoleReporter: [{
				module: 'good-squeeze',
				name: 'Squeeze',
				args: [{ log: '*', response: '*' }]
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
	// require('./api')
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
		this.sequelize = new Sequelize('cubing', 'root', 'wca');
		app.models = {};
		app.models.User = this.sequelize.define('user', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true
			},
			wca_id: Sequelize.STRING,
			name: Sequelize.STRING,
			email: {
				type: Sequelize.STRING,
				validate: {
					isEmail: true
				}
			},
			avatar: Sequelize.STRING
		}, {
			timestamps: false
		});

		// this.models = require('./models');

		server.register(plugins, function (err) {
			if (err) {
				console.error(77, err);
			}
			const tryAuth = {
				strategy: 'session',
				mode: 'optional'
			};

			// Should go into seperate files:
			if (DEV) {
				console.log('Setting up proxy...');
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
								host: '0.0.0.0',
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
						console.log(request.path);
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

			App.server.log('Server running at:', App.server.info.uri);
		});
	}
});

app.init();
