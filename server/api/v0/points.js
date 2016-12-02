'use strict';

const fs = require('fs');
const Boom = require('boom');
const wca = require('../../../lib/wca');

const personQuery = (wca_id) => `
SELECT personId,personName,
sum(wrAveragePoints) wrAveragePoints,
sum(wrSinglePoints) wrSinglePoints,
sum(crAveragePoints) crAveragePoints,
sum(crSinglePoints) crSinglePoints,
sum(nrAveragePoints) nrAveragePoints,
sum(nrSinglePoints) nrSinglePoints,
sum(compPoints) compPoints,
sum(wrAveragePoints+wrSinglePoints+crAveragePoints+crSinglePoints+nrAveragePoints+nrSinglePoints+compPoints) totalPoints
FROM Points
WHERE personId="${wca_id}"
GROUP BY personId,personName`;

const CachedQueries = {
	'': 'totalPoints',
	'year': 'totalPointsPastYear',
	'3months': 'totalPointsPast3Months',
	'6months': 'totalPointsPast6Months'
};

module.exports = (base) => [{
	method: 'GET',
	path: `${base}/points`,
	config: {
		handler: function (request, reply) {
			console.log(request.query);
			let file = `cache/${CachedQueries[request.query.past || '']}.json`;
			console.log(file);
			fs.readFile(file, function (err, data) {
				if (err) {
					reply(null);
					throw err;
				} else {
					reply(data);
				}
			});
		}
	}
}, {
	method: 'GET',
	path: `${base}/points/personEvent`,
	config: {
		handler: function (request, reply) {
			let include = request.query.include ? request.query.include.split(',') : wca.Events;
			request.server.methods.getAllPersonEventPoints(include, function (err, results) {
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
			let include = request.query.include ? request.query.include.split(',') : wca.Events;
			request.server.methods.getAllCountryEventPoints(include, function (err, results) {
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
			let include = request.query.include ? request.query.include.split(',') : wca.Events;
			request.server.methods.getAllCompetitionEventPoints(include, function (err, results) {
				if (err) {
					return reply(Boom.wrap(err, 500));
				}
				reply(results[0]);
			});
		}
	}
}];
