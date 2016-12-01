'use strict';

const _ = require('lodash/fp');
const Boom = require('boom');

const {sequelize} = App.db;

module.exports = (base) => [{
	method: 'GET',
	path: `${base}/search/people/{name?}`,
	config: {
		handler: function (request, reply) {
			sequelize.query(`SELECT * FROM PersonsPoints WHERE name LIKE '${request.params.name || ''}%' LIMIT 25;`).then(function (result) {
				reply(result[0]);
			}).catch(function (error) {
				reply(Boom.badRequest('Invalid query'));
			});
		}
	}
}];
