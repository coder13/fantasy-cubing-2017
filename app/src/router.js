const qs = require('qs');
const app = require('ampersand-app');
const Router = require('ampersand-router');
const ReactDOM = require('react-dom');
const moment = require('moment');
const Team = require('./models/team');

const Layout = require('./pages/layout');
const HomePage = require('./pages/home');
const ProfilePage = require('./pages/profile');
const StatsPage = require('./pages/stats');
const ManageTeamPage = require('./pages/manageTeam');
const TeamPage = require('./pages/team');
const RankingsPage = require('./pages/rankings');

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
		// 'stats': 'stats',
		'profile': 'profile',
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

	stats (query) {
		query = qs.parse(query);
		renderPage(<StatsPage past={query.past}/>, 'stats');
	},

	myTeam (query) {
		query = qs.parse(query);

		if (query.week && isNaN(+query.week)) {
			return this.redirectTo('profile/team');
		}

		let week = +query.week || app.currentWeek();

		let team = app.me.getTeam('Standard');

		if (team) {
			let renderTeam = (team) => {
				renderPage(
					<ProfilePage me={app.me}>
						<ManageTeamPage week={week} team={team}/>
					</ProfilePage>
				);
			};

			if (week) {
				team = new Team({id: team.id});
				team.fetch({

					week,
					error: err => {
						app.router.redirectTo('/profile/team');
					},
					success: () => renderTeam(team)
				});
			} else {
				team.fetch({
					error: err => {
						app.router.redirectTo('/');
					},
					success: () => renderTeam(team)
				});
			}
		} else {
			renderPage(<ProfilePage me={app.me}>
				<ManageTeamPage me={app.me} team={team}/>
			</ProfilePage>, 'teams');
		}
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
			return this.redirectTo('/');
		}

		team.fetch({
			week,
			error: function (err) {
				console.error(err);
				app.router.redirectTo('/');
			},
			success: function () {
				renderPage(<TeamPage week={week} team={team}/>);
			}
		});

		renderPage(<TeamPage week={week} team={team}/>);
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
