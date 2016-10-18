const qs = require('qs');
const xhr = require('xhr');
const app = require('ampersand-app');
const Router = require('ampersand-router');
const ReactDOM = require('react-dom');
const Layout = require('./pages/layout');
const IndexPage = require('./pages/index');
const StatsPage = require('./pages/stats');

const auth = function (name) {
	return function () {
		if (app.me.isLoggedIn) {
			this[name].apply(this, arguments);
		} else {
			this.redirectTo('/');
		}
	};
};

const renderPage = function (page, active, title) {
	page = (
		<Layout active={active} algsets={app.algsets} me={app.me}>
			{page}
		</Layout>
	);

	document.title = 'Fantasy Cubing' + (title ? '-' + title : '');
	ReactDOM.render(page, document.getElementById('root'));
};

module.exports = Router.extend({
	routes: {
		'': 'index',
		'teams': 'four',
		'cubers': 'four',
		'stats': 'stats',
		'login': 'login',
		'logout': 'logout',
		'authcallback?:query': 'authCallback',
		'*404': 'four'
	},

	index () {
		renderPage(<IndexPage/>, 'home');
	},

	stats () {
		renderPage(<StatsPage/>, 'stats');
	},

	login () {
		window.location = window.location.origin + '/login';
	},

	logout () {
		window.location = window.location.origin + '/logout';
	},

	authCallback (query) {
		this.redirect('/');
	},

	four () {
		this.redirect({
			message: 'Page doesn\' exist!'
		});
	},

	redirect (error) {
		console.trace();
		this.redirectTo('/');

		if (error) {
			app.errors.push(error);
		}
	}
});
