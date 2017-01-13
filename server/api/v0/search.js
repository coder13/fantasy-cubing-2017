const _ = require('lodash/fp');
const Boom = require('boom');

const {knex} = App.db;

module.exports = (server, base) => {
	server.route([{
		method: 'GET',
		path: `${base}/search/people/{name?}`,
		config: {
			handler: function (request, reply) {
				let name = request.params.name || '';

				let where = `${isNaN(+name.slice(0,1)) ? 'personName' : 'personId'} LIKE ?`;

				if (request.query && request.query.eventId) {
					return knex('TotalPointsByEvent').select('personId', 'personName', 'points').where({eventId: request.query.eventId}).whereRaw(where, `%${name}%`).limit(25)
						.then(result => reply(result))
						.catch(error => reply(Boom.wrap(error, 500)));
				} else {
					return knex('TotalPoints').select('personId', 'personName', 'points').whereRaw(where, `%${name}%`).limit(25)
						.then(result => reply(result))
						.catch(error => reply(Boom.wrap(error, 500)));
				}
			}
		}
	}]);
};
