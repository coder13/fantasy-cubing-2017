const React = require('react');
const {Alert} = require('react-bootstrap');
const app = require('ampersand-app');
const ampersandMixin = require('ampersand-react-mixin');
const NavHelper = require('../components/nav-helper');

// Main layout. Will always display list of competitors and their current points.
module.exports = React.createClass({
	mixins: [ampersandMixin],
	displayName: 'LayoutPage',

	componentDidMount () {
		app.on('all', function () {
			this.forceUpdate();
		}, this);
	},

	getInitialState () {
		return {};
	},

	render () {
		console.log(23, app.me.avatar);
		return (
			<NavHelper id='layout' style={{height: '100%', width: '100%'}}>
				<nav className='navbar navbar-default navbar-static-top' style={{marginBottom: '0px'}}>
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

						<div id='navbar' className='navbar-collapse disabled collapse' aria-expanded="false">
							<ul className='nav navbar-nav'>
								<li className={this.props.active === 'home' ? 'active' : ''}><a href='/'>Fantasy Cubing</a></li>
								<li className={this.props.active === 'teams' ? 'active' : ''}><a href='/'>Teams</a></li>
								<li className={this.props.active === 'cubers' ? 'active' : ''}><a href='/drill'>Cubers</a></li>
								<li className={this.props.active === 'stats' ? 'active' : ''}><a href='/about'>Stats</a></li>
							</ul>
							<ul className='nav navbar-nav pull-right'>
								<li>
									{app.me.isLoggedIn ? <a href='/logout'>Logout</a> : <a href='/login'>Login</a>}
								</li>
							</ul>
							{app.me.isLoggedIn ?
							<div className='pull-right'>
								<span>Logged in as {app.me.name} </span>
								<img width='50px' height='50px' src={app.me.avatar ? app.me.avatar.thumb_url : ''}/>
							</div> : ''}
						</div>
					</div>
				</nav>


				<div id='body'>
					{this.props.children}
				</div>

				<div id='footer' style={{height: '2em'}}/>
			</NavHelper>
		);
	}
});
