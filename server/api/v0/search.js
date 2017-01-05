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

				let where = `${isNaN(+name.slice(0,1)) ? 'personName' : 'personId'} LIKE :name`;

				if (request.query && request.query.eventId) {
					return sequelize.query(`SELECT personId, personName, kinch FROM Kinch WHERE eventId=:event AND ${where} LIMIT 25;`, {
						replacements: {
							event: request.query.eventId,
							name: `%${name}%`
						},
						type: sequelize.QueryTypes.SELECT
					}).then(result => reply(result))
						.catch(error => reply(Boom.wrap(error, 500)));
				} else {
					sequelize.query(`SELECT personId, personName, kinch FROM TotalKinch WHERE ${where} LIMIT 25;`, {
						replacements: {
							name: `%${name}%`
						},
						type: sequelize.QueryTypes.SELECT
					}).then(result => reply(result))
						.catch(error => reply(Boom.wrap(error, 500)));
				}
			}
		}
	}]);
};
