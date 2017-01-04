const fs = require('fs');``
const Boom = require('boom');
const wca = require('../../../lib/wca');
const queries = require('../../stats/queries');

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
	}, {
		method: 'GET',
		path: `${base}/records/{event?}`,
		config: {
			handler: function (request, reply) {
				let {event} = request.params;
				let {type, region, date} = request.query;

				console.log(41, region)

				// region = region || 'world';

				server.methods.getRecords({event, region, date}, function (err, results) {
					if (err) {
						return reply(err);
					}

					return reply(results);
				});
			}
		}
	}]);
};
