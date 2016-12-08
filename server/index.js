'use strict';

const app = require('ampersand-app');
const fs = require('fs');
const path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');
const shortId = require('shortid');
const moment = require('moment');
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
	require('./stats'),
	require('./auth'),
	require('./api')
];

const App = global.App = app.extend({
	init: function () {
		App.config = config;

		let server = this.server = new Hapi.Server({
			app: {
				dev: process.env.NODE_ENV !== 'prod'
			},
			debug: {
				request: ['error'],
				log: ['error']
			},
			connections: {
				routes: {
					files: {
						relativeTo: path.join(__dirname, '../app/public')
					}
				}
			},
			cache: [{
				name: 'redisCache',
				engine: require('catbox-redis'),
				host: '127.0.0.1',
				partition: 'cache'
			}]
		});

		// Configure connection
		server.connection({
			port: config.port
		});

		// Database
		this.db = require('./models/');

		server.method('getWeekend', function () {
			return moment().day(5).hour(8).minute(0).second(0).milliseconds(0);
		});

		server.register(plugins, function (err) {
			Hoek.assert(!err, 'Failed to register plugins: ' + err);

			if (server.settings.app.dev) {
				server.register(require('h2o2'));
			}

			require('./routes')(server);

			App.start();
		});
	},

	start: function () {
		App.server.start(function (err) {
			Hoek.assert(!err, 'Failed to start server: ' + err);

			let isDev = App.server.settings.app.dev;
			App.server.log('info', `${isDev ? 'Development' : 'Production'} Server running at: ${App.server.info.uri}`);
		});
	}
});

app.init();
