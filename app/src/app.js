// require('./assets/favicon.png');
require('./styles/main.styl');
require('./lib/bootstrap.min.js');

const App = require('ampersand-app');
const xhr = require('xhr');
const Router = require('./router');
const Me = require('./models/me');
const Team = require('./models/team');
const Teams = require('./models/teams');
const Matchups = require('./models/matchups');
const Config = require('./config');

if (typeof window !== 'undefined') {
	window.React = require('react');
}

const app = window.app = App.extend({
	props: {
		me: {
			type: 'state'
		}
	},

	init () {
		this.me = new Me();
		this.me.fetch({
			success: function (model, response, options) {
				app.me.team = new Team({owner: model.id});
				app.me.team.fetch({
					success: function () {
						// better way to do this?
						// Not rendering the page till we load at least me and me's team if he has a team.
						// This is to prevent weird rending bugs. There's no part of the site we want to render till this happens anyways.
						app.initRouter();
					}, error: function () {
						app.initRouter();
					}
				});
			},
			error: function () {
				app.initRouter();
			}
		});

		this.teams = new Teams();
		this.teams.fetch();

		xhr.get(`${app.apiURL}/times`, function (err, res, body) {
			if (body) {
				app.times = JSON.parse(body);
				app.matchups = new Matchups({
					league: 'Standard',
					week: app.times.week
				}); // already fetches
			}
		});
	},

	initRouter () {
		app.router = new Router();
		app.router.history.start();

		app.router.on('route', function (name, args) {
			if (name !== 'four') {
				app.errors = [];
			}
		});
	}
}, Config);

app.init();
