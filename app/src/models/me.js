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
		email: 'string',
		ELO: 'number'
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
		this.listenTo(this.teams, 'change', () => {
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
// app.me.team = new Team({owner: model.id});
// 				app.me.team.fetch({
// 					success: function () {
// 						// better way to do this?
// 						// Not rendering the page till we load at least me and me's team if he has a team.
// 						// This is to prevent weird rending bugs. There's no part of the site we want to render till this happens anyways.
// 						app.initRouter();
// 					}, error: function () {
// 					}