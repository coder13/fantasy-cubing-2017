const React = require('react');
const moment = require('moment');

const app = require('ampersand-app');
const ampersandMixin = require('ampersand-react-mixin');
const NavHelper = require('../components/nav-helper');

let active = (url) => (active) => active === url ? 'active' : '';

// Main layout. Will always display list of competitors and their current points.
module.exports = React.createClass({
	mixins: [ampersandMixin],
	displayName: 'LayoutPage',

	componentDidMount () {
		app.on('all', function () {
			this.forceUpdate();
		}, this);

		this.timeTillWeekend = window.setInterval(() => this.forceUpdate(), 1000);
	},

	componentWillUnMount () {
		window.clearInterval(this.timeTillWeekend);
	},

	getInitialState () {
		return {};
	},

	renderTimeTillWeekend () {
		if (app.times) {
			let diff = app.times.weekend - moment().unix();
			if (diff < 0) {
				return (
					<div id='timeline'>
						<p style={{textAlign: 'center'}}>New week starts <span title={moment().endOf('week').toString()}>{moment().endOf('week').fromNow()}</span></p>
					</div>
				);
			}

			let timeTillWeekend = moment.duration(app.times.weekend - moment().unix(), 'seconds');

			let days = timeTillWeekend.days();
			let hours = timeTillWeekend.hours();
			let minutes = timeTillWeekend.minutes();
			let seconds = timeTillWeekend.seconds();

			return (
				<div id='timeline'>
					<p style={{textAlign: 'center'}}>{days} days {hours} hours {minutes} minutes {seconds} seconds till this weekend's competitions</p>
				</div>
			);
		} else {
			return null;
		}
	},

	render () {
		let team = app.me.team;

		return (
			<NavHelper id='layout' style={{height: '100%', width: '100%'}}>
				{this.renderTimeTillWeekend()}
				<nav className='navbar navbar-default navbar-light bg-faded' style={{marginBottom: '0px'}}>
					<div className='container-fluid'>
						<div className='navbar-header'>
							<button type='button' className='navbar-toggle' data-toggle='collapse' data-target='#navbar' style={{height: '40px'}}>
								<span className='sr-only'>Toggle navigation</span>

								<span className='icon-bar'></span>
								<span className='icon-bar'></span>
								<span className='icon-bar'></span>
								<a className='navbar-brand' href='/home'></a>
							</button>
						</div>

						<div id='navbar' className='navbar-collapse disabled collapse'>
							<ul className='nav navbar-nav'>
								<li className={active('home')(this.props.active)}><a href='/'>Fantasy Cubing</a></li>
								<li className={active('teams')(this.props.active)}><a href='/teams'>Teams</a></li>
								<li className={active('stats')(this.props.active)}><a href='/stats'>Stats</a></li>
							</ul>
							<ul className='nav navbar-nav navbar-center'>
								<li className={active('matchups')(this.props.active)}><a href='/matchups'><b>Matchups</b></a></li>
							</ul>
							<ul className='nav navbar-nav navbar-right'>
							{app.me.isLoggedIn  ? [
								team.id ?
									<li key={0} className='nav navbar-text'>
										<b title='ELO'>{team.ELO}</b> <span title='Wins-Losses-Ties'>({8}-{3}-{2})</span>
									</li> :
									<li key={0} className='nav navbar-text'>Make your team!</li>,
								<li key={1} className='dropdown'>
									<a href='' className='dropdown-toggle top-nav' data-toggle='dropdown' data-hover='dropdown'>
										<div className='avatar-thumbnail' style={{
												backgroundImage: app.me.avatar ? `url(${app.me.avatar.thumb_url})` : '',
												width: '40px',
												height: '40px',
												marginTop: '-10px',
												marginBottom: '-10px'
											}}/>
										<span className='caret'/>
									</a>
									<ul className='dropdown-menu' role='menu'>
										<li role="presentation" className='dropdown-header'>Caleb Hoover</li>
										<li><a href='/profile/team'>Manage Team</a></li>
										<li className='divider'/>
										<li><a href='/logout'>Log out</a></li>
									</ul>
								</li>
								] : <li><a href='/login'>Log in</a></li>
							}
							</ul>
						</div>
					</div>
				</nav>

				<div id='alerts' className='container'>
					{app.me.isLoggedIn && !team.id ?
						<div className='alert alert-danger' role='alert'>
							You don't have a team yet, make yours <a href='/profile/team' className='alert-link'>here</a>!
						</div>
					: null}
				</div>

				<div id='body'>
					{this.props.children}
				</div>

				<div id='footer' style={{height: '2em'}}/>
			</NavHelper>
		);
	}
});
