const app = require('ampersand-app');
const Model = require('ampersand-model');
const Collection = require('ampersand-collection');
const Team = require('./team');

module.exports = Model.extend({
	props: {
		id: 'number',
		name: 'string',
		wca_id: 'string',
		avatar: 'object',
		email: 'string',
		teamId: 'string'
	},

	children: {
		team: Team
	},

	derived: {
		isLoggedIn: {
			deps: ['id'],
			fn () {
				return !!this.id;
			}
		},
		isAdmin: {
			deps: ['id'],
			fn() {
				return this.id === 8184;
			}
		}
	},

	initialize (options) {
		this.set(options);
	},

	url () {
		return `${app.apiURL}/me`;
	}
});
