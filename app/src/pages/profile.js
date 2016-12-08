const app = require('ampersand-app');
const React = require('react');
const ampersandMixin = require('ampersand-react-mixin');
const {Menu} = require('semantic-ui-react');
const moment = require('moment');
const NavHelper = require('../components/nav-helper');

module.exports = React.createClass({
	mixins: [ampersandMixin],
	displayName: 'ProfilePage',

	componentDidMount () {
	},

	getInitialState () {
		return {};
	},

	render () {

		return (
			<div>
				<div id='body'>
					{this.props.children}
				</div>
			</div>
		);
	}
});

