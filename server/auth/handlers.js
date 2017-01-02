const qs = require('qs');
const Boom = require('boom');

const {User, Team} = App.db;

let users = [];

module.exports = {
	login: function (request, reply) {
		if (!request.auth.isAuthenticated) {
			return reply('Authentication failed due to: ' + request.auth.error.message);
		}

		let creds = request.auth.credentials;

		request.cookieAuth.set(creds);
		users[creds.profile.id] = creds.profile;

		// Add/update user if they don't exist.
		User.findOrCreate({
			where: {
				id: creds.profile.id
			},
			defaults: {
				id: creds.profile.id,
				wca_id: creds.profile.wca_id,
				name: creds.profile.name,
				email: creds.profile.email,
				avatar: creds.profile.avatar.url
			}
		}).then(function (result) {
			let user = result[0];
			let exists = !result[1];

			if (!exists) {
				request.server.log('info', `Created User ${result[0].id}`);
			}
		});

		return reply.redirect('/');
	},

	logout: function(request, reply) {
		request.cookieAuth.clear();
		return reply().redirect('/');
	},

	profile: function (request, reply) {
		if (!request.auth.isAuthenticated) {
			return reply().code(401);
		}

		let profile = request.auth.credentials.profile;
		User.findById(profile.id).then(function (user) {
			if (!user) {
				user = User.build(profile);
			}

			return Team.findAll({
				attributes: ['id', 'owner', 'name', 'league', 'points'],
				where: {
					owner: profile.id
				}
			}).then(function (teams) {
				user.teams = teams;
				return reply({
					id: user.id,
					wca_id: user.wca_id,
					name: user.name,
					avatar: profile.avatar,
					email: user.email,
					teams: teams
				});
			}).catch(error => reply(Boom.wrap(error, 500)));
		}).catch(error => reply(Boom.wrap(error, 500)));
	}
};
