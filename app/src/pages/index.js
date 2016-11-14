const app = require('ampersand-app');
const React = require('react');
// const {Modal, Button, ButtonInput, Input} = require('react-bootstrap');
const ampersandReactMixin = require('ampersand-react-mixin');
const xhr = require('xhr');

module.exports = React.createClass({
	displayName: 'HomePage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {};
	},

	render () {
		return (
			<div className='container'>
				<div className='page-header' style={{margin: '20px'}}>
					<h1 className='text-center' style={{margin: '20px'}}>Fantasy Cubing</h1>
				</div>
				<a href='/matchups'>View this weekend's matchups!</a>
			</div>
		);
	}
});
