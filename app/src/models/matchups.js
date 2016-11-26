const Collection = require('ampersand-rest-collection');
const Matchup = require('./matchup');

module.exports = Collection.extend({
	model: Matchup,

	initialize (options) {
		this.league = options.league;
		this.week = options.week;
		this.fetch();
	},

	url () {
		return `${app.apiURL}/matchups/${this.league}/${this.week}`;
	}
});
