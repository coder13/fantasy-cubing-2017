const fs = require('fs');
const Boom = require('boom');
const wca = require('../../../lib/wca');

module.exports = (server, base) => {
	server.route([{
		method: 'GET',
		path: `${base}/points/personEvent`,
		config: {
			handler: function (request, reply) {
				let events = request.query.events ? request.query.events.split(',') : wca.Events;
				// let region = request.query.region ? request.query.region : 'all';
				request.server.methods.getAllPersonEventPoints(events, function (err, results) {
					if (err) {
						return reply(Boom.wrap(err, 500));
					}
					reply(results[0]);
				});
			}
		}
	}, {
		method: 'GET',
		path: `${base}/points/countryEvent`,
		config: {
			handler: function (request, reply) {
				let events = request.query.events ? request.query.events.split(',') : wca.Events;
				request.server.methods.getAllCountryEventPoints(events, function (err, results) {
					if (err) {
						return reply(Boom.wrap(err, 500));
					}
					reply(results[0]);
				});
			}
		}
	}, {
		method: 'GET',
		path: `${base}/points/competitionEvent`,
		config: {
			handler: function (request, reply) {
				let events = request.query.events ? request.query.events.split(',') : wca.Events;
				request.server.methods.getAllCompetitionEventPoints(events, function (err, results) {
					if (err) {
						return reply(Boom.wrap(err, 500));
					}
					reply(results[0]);
				});
			}
		}
	}]);
};
