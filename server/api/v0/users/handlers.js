'use strict';

const Joi = require('joi');
const Boom = require('boom');
const mongoose = require('mongoose');

const User = App.db.User;

module.exports = {
	getAll: function (request, reply) {
		if (request.role === 'Admin') {
			User.find(function (err, users) {
				if (err) {
					return reply(Boom.internal('Internal MongoDB error', err));
				}

				reply(users);
			});
		} else {
			reply(Boom.unauthorized());
		}
	}
};
