var app = require('ampersand-app');
var React = require('react');
var localLinks = require('local-links');

module.exports = React.createClass({
	displayName: 'NavHelper',

	onClick (event) {
		const pathname = localLinks.getLocalPathname(event);

		if (pathname) {
			event.preventDefault();
			app.router.history.navigate(pathname);
		}
	},

	render () {
		return (
			<div {...this.props} onClick={this.onClick}>
				{this.props.children}
			</div>
		);
	}
});
