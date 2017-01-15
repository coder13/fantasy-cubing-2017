const app = require('ampersand-app');
const Model = require('ampersand-model');
const Collection = require('ampersand-model');
const xhr = require('xhr');
const shortid = require('shortid');
const Week = require('./week');
const Owner = require('./owner');

module.exports = window.Team = Model.extend({
	props: {
		id: {
			type: 'string'
		},
		name: 'string',
		league: 'string',
		points: 'number',
		weeks: 'object'
	},

	children: {
		owner: Owner
	},


	initialize () {
		this.weeks = {};
	},

	fetchWeek(weekNo, options) {
		let week = new Week({
			teamId: this.id,
			week: weekNo
		});

		week.on('change', (event) => {
		});

		week.fetch(options);
		week.owner = this.owner;

		this.weeks[weekNo] = week;
	},

	url () {
		return `${app.apiURL}/teams/${this.id || ''}`;
	}
});
