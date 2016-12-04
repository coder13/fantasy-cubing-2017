const qs = require('qs');
const xhr = require('xhr');
const app = require('ampersand-app');
const Router = require('ampersand-router');
const ReactDOM = require('react-dom');
const moment = require('moment');
const Team = require('./models/team');
const Layout = require('./pages/layout');
const IndexPage = require('./pages/index');
const MatchupsPage = require('./pages/matchups');
const StatsPage = require('./pages/stats');
const ManageTeamPage = require('./pages/manageTeam');
const TeamPage = require('./pages/team');
const TeamsPage = require('./pages/teams');

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
		<Layout active={active} app={app} me={app.me}>
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
		'profile': 'profile',
		'profile/team': 'myTeam',
		'matchups': 'matchups',
		'teams': 'teams',
		'teams/:id': 'teams',
		'login': 'login',
		'logout': 'logout',
		'authcallback?:query': 'authCallback',
		'*404': 'four'
	},

	index () {
		renderPage(<IndexPage/>, 'home');
	},

	stats (query) {
		query = qs.parse(query);
		renderPage(<StatsPage past={query.past}/>, 'stats');
	},

	matchups () {
		app.matchups.setWeek(app.times.week || 0).fetch();
		renderPage(<MatchupsPage week={app.times.week || 0} matchups={app.matchups}/>, 'matchups');
	},

	myTeam () {
		renderPage(<ManageTeamPage me={app.me}/>, 'teams');
	},

	teams (id, query) {
		if (id === null) {
			app.teams.fetch();
			return renderPage(<TeamsPage teams={app.teams}/>);
		}

		query = qs.parse(query);

		let week = +query.week || moment().week();

		console.log(82, week)

		let team = app.teams.get({id: id});
		if (team) {
			team.fetch({week});
			renderPage(<TeamPage week={week} team={team}/>);
		} else {
			let team = new Team({id: id});
			if (!team.isValid()) {
				return this.redirectTo('/');
			}

			team.fetch({
				week,
				error: function () {
					app.router.redirectTo('/');
				}
			});

			renderPage(<TeamPage week={week} team={team}/>);

		}
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
		this.redirectTo('/');
	}
});
