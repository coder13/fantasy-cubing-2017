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

				let where = `${isNaN(+name.slice(0,1)) ? 'name' : 'id'} LIKE '${name}%'`;

				if (request.query && request.query.eventId) {
					return sequelize.query(`SELECT * FROM PersonEventPoints WHERE eventId='${request.query.eventId}' AND ${where} LIMIT 25;`)
						.then(result => reply(result[0]))
						.catch(error => reply(Boom.wrap(error, 500)));
				}

				sequelize.query(`SELECT * FROM PersonsPoints WHERE ${where} LIMIT 25;`)
					.then(result => reply(result[0]))
					.catch(error => reply(Boom.wrap(error, 500)));
			}
		}
	}]);
};
