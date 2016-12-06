const Collection = require('ampersand-rest-collection');
const Matchup = require('./matchup');

module.exports = Collection.extend({
	model: Matchup,

	initialize (models, options) {
		this.league = options.league;
		this.week = options.week;
	},

	setWeek (week) {
		this.week = week;
		return this;
	},

	url () {
		return `${app.apiURL}/matchups/${this.league}/${this.week}`;
	}
});
