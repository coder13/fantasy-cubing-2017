require('../../semantic/dist/semantic.css');
require('./styles/main.styl');

const App = require('ampersand-app');
const xhr = require('xhr');
const moment = require('moment');
const Router = require('./router');
const Me = require('./models/me');
const Team = require('./models/team');
const Teams = require('./models/teams');
const Config = require('./config');

window.xhr = xhr;

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
		this.times = {
			week: moment.utc().week()
		};

		this.getTimes();

		this.me = new Me();
		this.me.fetch({
			success: function (model, res, options) {
				app.me.teams.fetch();
				app.initRouter();
			},
			error: function (model, res, options) {
				app.initRouter();
			}
		});

	},

	/* Helps us stay on track with the current week and weekend time */
	getTimes () {
		xhr.get(`${app.apiURL}/times`, function (err, res, body) {
			if (body) {
				app.times = JSON.parse(body);
			}
		});
	},

	currentWeek () {
		return app.times ? app.times.week : moment.utc().week();
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
