 'use strict';

const _ = require('lodash/fp');
const Boom = require('boom');

const {sequelize} = App.db;

module.exports = (server, base) => {
	server.route([{
		method: 'GET',
		path: `${base}/search/people/{name?}`,
		config: {
			handler: function (request, reply) {
				let name = request.params.name || '';

				let where = `${isNaN(+name.slice(0,1)) ? 'name' : 'id'} LIKE :name`;

				if (request.query && request.query.eventId) {
					return sequelize.query(`SELECT id,name,totalPoints points FROM PersonEventPoints WHERE eventId=:event AND ${where} LIMIT 25;`, {
						replacements: {
							event: request.query.eventId,
							name: `%${name}%`
						},
						type: sequelize.QueryTypes.SELECT
					}).then(result => reply(result))
						.catch(error => reply(Boom.wrap(error, 500)));
				}

				sequelize.query(`SELECT id,name,points FROM PersonsPoints WHERE ${where} LIMIT 25;`, {
					replacements: {
						name: `%${name}%`
					},
					type: sequelize.QueryTypes.SELECT
				})
					.then(result => reply(result))
					.catch(error => reply(Boom.wrap(error, 500)));
			}
		}
	}]);
};
