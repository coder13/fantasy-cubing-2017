const app = require('ampersand-app');
const Model = require('ampersand-model');
const Collection = require('ampersand-collection');
const Team = require('./team');

module.exports = Model.extend({
	props: {
		id: 'number',
		name: 'string',
		wca_id: 'string'
	},

	children: {
		team: Team
	},

	url () {
		return `${app.apiURL}/users/${id}`;
	}
});
