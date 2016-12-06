const app = require('ampersand-app');
const Model = require('ampersand-model');
const Team = require('./team');

module.exports = Model.extend({
	props: {
		week: 'number',
		league: 'string'
	},

	children: {
		homeTeam: Team,
		awayTeam: Team
	}
});
