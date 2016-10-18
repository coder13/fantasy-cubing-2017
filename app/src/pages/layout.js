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

						<div id='navbar' className='navbar-collapse disabled collapse'>
							<ul className='nav navbar-nav'>
								<li className={this.props.active === 'home' ? 'active' : ''}><a href='/'>Fantasy Cubing</a></li>
								<li className={this.props.active === 'teams' ? 'active' : ''}><a href='/teams'>Teams</a></li>
								<li className={this.props.active === 'cubers' ? 'active' : ''}><a href='/cubers'>Cubers</a></li>
								<li className={this.props.active === 'stats' ? 'active' : ''}><a href='/stats'>Stats</a></li>
							</ul>
							<ul className='nav navbar-nav navbar-right'>
							{app.me.isLoggedIn ?
								<li className='dropdown'>
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
										<li><a href='/manageTeam'>Manage Teams</a></li>
										<li className='divider'/>
										<li><a href='/logout'>Log out</a></li>
									</ul>
								</li> :
								<li><a href='/login'>Log in</a></li>
							}
							</ul>
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
