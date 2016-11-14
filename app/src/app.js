// require('./assets/favicon.png');
require('./styles/main.styl');
require('./lib/bootstrap.min.js');

const App = require('ampersand-app');
const Router = require('./router');
const Me = require('./models/me');
const Team = require('./models/team');
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
				app.me.team.fetch();
			}
		});

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
