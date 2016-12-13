const _ = require('lodash/fp');
const Boom = require('boom');

const {League} = App.db;

module.exports = (server, base) => {
	server.route([{
		method: 'GET',
		path: `${base}/leagues/{id}`,
		config: {
			handler: function (request, reply) {
				League.findById(+request.params.id).then(function (league) {
					reply(league);
				}).catch(error => reply(Boom.wrap(error, 500)));
			}
		}
	}]);
};
