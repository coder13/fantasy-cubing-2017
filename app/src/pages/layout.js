const app = require('ampersand-app');
const React = require('react');
const ampersandMixin = require('ampersand-react-mixin');
const moment = require('moment');
const {Container, Menu, Dropdown, Image} = require('semantic-ui-react');
const NavHelper = require('../components/nav-helper');

module.exports = React.createClass({
	mixins: [ampersandMixin],
	displayName: 'LayoutPage',

	componentDidMount () {
		app.on('change', function () {
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

					// <Menu.Item name='stats' active={active === 'stats'} href='/stats'/>
	render () {
		let {active} = this.props;
		let team = app.me.getTeam('Standard');

		return (
			<NavHelper id='layout' style={{height: '100%', width: '100%'}}>
				{this.renderTimeTillWeekend()}
				<Menu>
					<Menu.Item name='Fantasy Cubing' active={active === 'home'} href='/'/>
					<Menu.Item name='teams' active={active === 'teams'} href='/teams'/>

					{app.me.isLoggedIn ? 
						<Menu.Menu position='right'>
							<Menu.Item href='/profile/team'>{team.name}: <b title='TotalPoints'>{team.Points}</b> <span title='Rank'></span></Menu.Item>
							<Menu.Item as={Dropdown} trigger={<Image size={'mini'} src={app.me.avatar ? app.me.avatar.thumb_url : ''}/>}>
								<Dropdown.Menu>
									<Dropdown.Item text='Profile' icon='user' href=''/>
									<Dropdown.Item text='Manage Team' href='/profile/team'/>
								</Dropdown.Menu>
							</Menu.Item>
						</Menu.Menu> :
						<Menu.Menu position='right'>
							<Menu.Item name='login' href='/login'/>
						</Menu.Menu>
					}
				</Menu>

				<div id='alerts' className='container'>
					{app.me.isLoggedIn && !team ?
						<div className='alert alert-danger' role='alert'>
							You don't have a team yet, make yours <a href='/profile/team' className='alert-link'>here</a>!
						</div>
					: null}
				</div>

				<Container id='body'>
					{this.props.children}
				</Container>

				<div id='footer' style={{height: '2em'}}/>
			</NavHelper>
		);
	}
});

