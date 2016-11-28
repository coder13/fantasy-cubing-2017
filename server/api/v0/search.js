'use strict';

const _ = require('lodash/fp');
const Boom = require('boom');

const {sequelize} = App.db;

const base = '/api/v0/search/people';

module.exports = [{
	method: 'GET',
	path: `${base}/{name}`,
	config: {
		handler: function (request, reply) {
			sequelize.query(`SELECT * FROM PersonsPoints WHERE name LIKE '${request.params.name}%' LIMIT 25;`).then(function (result) {
				reply(result);
			}).catch(function (error) {
				console.log(error);
				reply(Boom.badRequest('Invalid query'));
			});
		}
	}
}];
