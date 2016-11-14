const app = require('ampersand-app');
const Model = require('ampersand-model');
const xhr = require('xhr');
const Team = require('./team');

module.exports = Model.extend({
	props: {
		id: 'number',
		name: 'string',
		wca_id: 'string',
		avatar: 'object',
		email: 'string',
		team: {
			type: 'state'
		}
	},

	derived: {
		isLoggedIn: {
			deps: ['id'],
			fn () {
				return !!this.id;
			}
		}
	},

	url () {
		return `${app.apiURL}/me`;
	}
});
