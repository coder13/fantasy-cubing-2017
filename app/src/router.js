const qs = require('qs');
const app = require('ampersand-app');
const Router = require('ampersand-router');
const ReactDOM = require('react-dom');
const moment = require('moment');
const Team = require('./models/team');

const Layout = require('./pages/layout');
const HomePage = require('./pages/home');
const ProfilePage = require('./pages/profile');
const TeamPage = require('./pages/team');
const RankingsPage = require('./pages/rankings');
const MostPickedPage = require('./pages/stats/mostPicked');
const CuberSearchPage = require('./pages/cuberSearch');
const CuberPage = require('./pages/stats/cuberPage');

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
		// 'stats/:stat': 'stats',
		'cubers': 'cubers',
		'points/cubers/:personId': 'cuberPoints',
		'stats/mostPicked': 'mostPicked',
		'profile/team': 'myTeam',
		'rankings': 'rankings',
		'teams/:id': 'team',
		'login': 'login',
		'logout': 'logout',
		'authcallback?:query': 'authCallback',
		'*404': 'four'
	},

	index () {
		renderPage(<HomePage/>, 'home');
	},

	// stats (stat) {
	// 	if (!stat) {
	// 		return this.redirect(`/stats/${StatsPage.stats[0].route}`);
	// 	}

	// 	renderPage(<StatsPage/>, 'stats');
	// },

	mostPicked (query) {
		query = qs.parse(query);

		let redirect = (week, limit) => this.redirectTo(`/stats/mostPicked?week=${week}`);

		if (!query.week) {
			return redirect(app.currentWeek() - 1);
		}

		if (query.week && isNaN(+query.week)) {
			return redirect(app.currentWeek() - 1);
		}

		if (query.week < 0) {
			return redirect(1);
		} else if (query.week >= app.currentWeek()) {
			return redirect(app.currentWeek() - 1);
		}

		let week = +query.week || (app.currentWeek() - 1);

		renderPage(<MostPickedPage week={week}/>, 'home');
	},

	cubers () {
		renderPage(<CuberSearchPage/>, 'cubers');
	},

	cuberPoints (personId) {
		renderPage(<CuberPage personId={personId}/>, 'stats');
	},

	myTeam (query) {
		if (!app.me.isLoggedIn) {
			return this.redirectTo('/');
		}

		query = qs.parse(query);

		if (query.week && isNaN(+query.week)) {
			return this.redirectTo('/profile/team');
		}

		let week = +query.week || app.currentWeek();

		let team = app.me.team;

		if (team.id) {
			team.fetch();
			team.fetchWeek(week);
		}

		renderPage(<ProfilePage me={app.me}>
			<TeamPage me={app.me} team={team} week={week} canEdit={true}/>
		</ProfilePage>, 'teams');
	},

	rankings (query) {
		query = qs.parse(query);

		return renderPage(<RankingsPage view={query.week ? 'weekly' : 'allTime'} week={query.week}/>, 'rankings');
	},

	team (id, query) {
		query = qs.parse(query);

		if (query.week && isNaN(+query.week)) {
			return this.redirectTo('/teams/' + id);
		}

		let week = +query.week || app.currentWeek();

		let team = new Team({id: id});
		if (!team.isValid()) {
			return this.redirectTo('/rankings');
		}


		team.fetch();
		team.fetchWeek(week, {
			error: function (model, res, body) {
				if (res.statusCode === 401) {
					renderPage(<TeamPage week={week} team={team} canView={app.me.isAdmin}/>);
				}	else {
					app.router.redirectTo('/rankings');
				}
			},
			success: function (model, res, body) {
				renderPage(<TeamPage week={week} team={team} canEdit={app.me.isAdmin}/>);
			}
		});
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
