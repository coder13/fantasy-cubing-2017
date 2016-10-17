const Hoek = require('hoek');

module.exports = function (server, options) {
	Hoek.assert(options, 'Missing users auth strategy options');
	Hoek.assert(typeof options.role === 'string', 'options.role must be a string');

	return {
		authenticate: function (request, reply) {
			console.log(request.credentials);
			return reply.continue({
				credentials: request.credentials
			});
		}
	};
};
