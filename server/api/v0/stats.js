const fs = require('fs');
const Boom = require('boom');
const wca = require('../../../lib/wca');

module.exports = (server, base) => {
	server.route([{
		method: 'GET',
		path: `${base}/stats/{stat}`,
		config: {
			handler: function (request, reply) {
				let stat = request.params.stat;

				if (!stat) {
					reply(Boom.badRequest('Stat not specified'));
				}

				console.log(stat);
				if (Object.keys(request.server.methods.points).indexOf(stat) > -1) {
					request.server.methods.points[stat](request.query, function (err, results) {
						if (err) {
							return reply(err);
						}

						return reply(results);
					});
				} else {
					reply(Boom.badRequest('Invalid Stat'));
				}

			}
		}
	}]);
};
