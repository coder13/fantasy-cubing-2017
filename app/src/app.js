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
			success: function () {
				app.me.teams.fetch();
			}
		});

		/* Global list of team */
		this.teams = new Teams();
		this.teams.fetch();

		this.getTimes();

		this.initRouter();
	},

	/* Helps us stay on track with the current week and weekend time */
	getTimes () {
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
