const app = require('ampersand-app');
const Model = require('ampersand-model');
const Collection = require('ampersand-collection');
const Team = require('./team');

const Teams = Collection.extend({
	model: Team,

	find: function (func) {
		return this.models.find(func);
	},

	fetch () {
		this.models.forEach(function (team) {
			team.fetch();
		});
	}
});

module.exports = Model.extend({
	props: {
		id: 'number',
		name: 'string',
		wca_id: 'string',
		avatar: 'object',
		email: 'string'
	},

	collections: {
		teams: Teams
	},

	derived: {
		isLoggedIn: {
			deps: ['id'],
			fn () {
				return !!this.id;
			}
		}
	},

	initialize (options) {
		this.set(options);


		this.listenTo(this.teams, 'sync', (type) => {
			this.trigger('change');
		}, this);

		this.listenTo(this.teams, 'change', (type) => {
			this.trigger('change');
		}, this);
	},

	getTeam(league) {
		return this.teams.find(t => t.league === league);
	},

	url () {
		return `${app.apiURL}/me`;
	}
});
