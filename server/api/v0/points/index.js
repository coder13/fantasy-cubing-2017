'use strict';

const fs = require('fs');
const Boom = require('boom');
// const handlers = require('./handlers');

const base = '/api/v0';

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

module.exports = [{
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
}];
