'use strict';
const qs = require('qs');

const User = App.models.User;

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

			if (exists) {
				console.log('User already exists');
			}

			console.log('created user with id', creds.profile.id);
		});

		return reply.redirect('/');
	},

	logout: function(request, reply) {
		request.cookieAuth.clear();
		return reply().redirect('/');
	},

	profile: function (request, reply) {
		if (request.auth.isAuthenticated) {
			User.findById(request.auth.credentials.profile.id)
			.then(function (user) {
				user.avatar = request.auth.credentials.profile.avatar;
				reply(user);
			});
		} else {
			reply().code(401);
		}
	}
};
