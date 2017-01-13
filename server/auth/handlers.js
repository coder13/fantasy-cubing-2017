const _ = require('lodash');
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

		// Create or update user if they don't exist.
		let user = User.findOne({
			id: creds.profile.id
		}, {
			require: false
		}).then(function (user) {
			if (user) {
				return user.save({
					wca_id: creds.profile.wca_id,
					name: creds.profile.name,
					email: creds.profile.email
				});
			} else {
				return User.create({
					id: creds.profile.id,
					wca_id: creds.profile.wca_id,
					name: creds.profile.name,
					email: creds.profile.email
				}, {
					method: 'insert'
				});
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

		User.where({id: profile.id}).fetch({
			withRelated: 'team'
		}).then(function (user) {
			let profileAttributes = {
				id: profile.id,
				email: profile.email,
				wca_id: profile.wca_id,
				avatar: profile.avatar
			};

			reply(user ? _.extend(user.toJSON(), profileAttributes) : profileAttributes);
		}).catch(err => reply(err));
	}
};
