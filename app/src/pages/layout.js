const app = require('ampersand-app');
const React = require('react');
const ampersandMixin = require('ampersand-react-mixin');
const moment = require('moment');
const {Segment, Container, Message, Menu, Dropdown, Image, Icon} = require('semantic-ui-react');
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
			let timeTillWeekend = moment.duration(app.times.weekend - moment().unix(), 'seconds');

			let days = timeTillWeekend.days();
			let hours = timeTillWeekend.hours();
			let minutes = timeTillWeekend.minutes();
			let seconds = timeTillWeekend.seconds();

			return (
				<div id='timeline'>
					<p style={{textAlign: 'center'}}>{days} days {hours} hours {minutes} minutes {seconds} seconds till week {app.times.week} competitions</p>
				</div>
			);
		} else {
			return null;
		}
	},

	render () {
		let {active} = this.props;
		let team = app.me.team;

		return (
			<NavHelper id='layout' style={{height: '100%', width: '100%'}}>
				<div id='wrap'>
				{this.renderTimeTillWeekend()}
				<Menu>
					<Menu.Item name='Fantasy Cubing' active={active === 'home'} href='/'/>
					<Menu.Item name='Rankings' active={active === 'rankings'} href='/rankings'/>
					<Menu.Item as={Dropdown} trigger='Stats' active={active === 'stats'}>
						<Dropdown.Menu>
							<Dropdown.Item text='Most Picked' href='/stats/mostPicked'/>
						</Dropdown.Menu>
					</Menu.Item>
					<Menu.Item name='How To Play' target='_blank' href='https://docs.google.com/document/d/19RREAJCZZPHIBhVGkEn47fB8Xy2vu7NuYFg7Kq6qHKk'/>

					{app.me.isLoggedIn ?
						<Menu.Menu position='right'>
							{team.id ? <Menu.Item href='/profile/team'>{team.name}: <b title='TotalPoints'>{team.points}</b> <span title='Rank'></span></Menu.Item> :
								<Menu.Item href='/profile/team'>Make your team!</Menu.Item>}
							<Menu.Item as={Dropdown} trigger={<Image size={'mini'} src={app.me.avatar ? app.me.avatar.thumb_url : ''}/>}>
								<Dropdown.Menu>
									<Dropdown.Item text='Manage Team' href='/profile/team'/>
									<Dropdown.Item text='Logout' href='logout'/>
								</Dropdown.Menu>
							</Menu.Item>
						</Menu.Menu> :
						<Menu.Menu position='right'>
							<Menu.Item name='login' href='/login'/>
						</Menu.Menu>
					}
				</Menu>

				<Container id='alerts'>
					{app.me.isLoggedIn && !team ?
						<Message negative>
							<p>You don't have a team yet, make yours <a href='/profile/team' className='c-link'>here</a>!</p>
						</Message>
					: null}
				</Container>

				<br/>

				<Container id='body'>
					{this.props.children}
				</Container>

				</div>
				<Segment id='footer'>
					<p style={{textAlign: 'center'}}><strong>Fantasy Cubing</strong> By <a target='_blank' href='https://github.com/coder13' className='c-link'>Caleb Hoover</a></p>
					<p style={{textAlign: 'center'}}>
						<a target='_blank' href='https://www.facebook.com/groups/FantasyCubing2017/' className='iconLink'><Icon link size='big' name='facebook'/></a>
						<a target='_blank' href='https://github.com/coder13/fantasycubing' className='iconLink'><Icon link size='big' name='github'/></a>
					</p>
				</Segment>
			</NavHelper>
		);
	}
});

					// <p style={{textAlign: 'center', margin: '5px'}}>
					// 	<span title='English'> English </span>|
					// 	<span title='Spanish'> Español </span>|
					// 	<span title='Canadian French'> Français (CA) </span>|
					// 	<span title='Korean'> 한국어 </span>|
					// 	<span title='Brazilian portuguese'> Português (BR) </span>|
					// 	<span title='Finnish'> Suomi </span>|
					// 	<span title='Swedish'> Svenska </span>
					// </p>
					// <p style={{textAlign: 'center', margin: '5px'}}>Not listed? Help Us Translate!</p>
