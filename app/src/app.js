// require('./assets/favicon.png');
require('./styles/main.styl');
require('jquery');
require('./lib/bootstrap.min.js');

const App = require('ampersand-app');
const Router = require('./router');
const Me = require('./models/me');
const Config = require('./config');

if (typeof window !== 'undefined') {
	window.React = require('react');
}

const app = window.app = App.extend({
	// Used by pages/layout.js to display errors when fetch data.
	// router.js will append to this when it receives errors when fetching data.
	errors: [],

	init () {
		this.me = new Me();
		this.me.fetch();

		app.router = new Router();
		app.router.history.start();

		app.router.on('route', function (name, args) {
			console.log(name);
			if (name !== 'four') {
				app.errors = [];
			}
		});
	}
}, Config);

app.init();
