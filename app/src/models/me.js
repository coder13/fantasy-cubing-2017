const app = require('ampersand-app');
const Model = require('ampersand-model');
const xhr = require('xhr');

module.exports = Model.extend({
	props: {
		id: 'number',
		name: 'string',
		wca_id: 'string',
		avatar: 'object',
		email: 'string'
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
