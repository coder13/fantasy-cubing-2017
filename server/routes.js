const tryAuth = {
	strategy: 'session',
	mode: 'optional'
};

module.exports = function (server) {
	// Should go into seperate files:
	if (server.settings.app.dev) {
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
};
