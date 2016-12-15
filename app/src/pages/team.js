const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const {Modal, Segment, Menu, Button} = require('semantic-ui-react');
const ampersandReactMixin = require('ampersand-react-mixin');
const xhr = require('xhr');
const {Events, EventNames, League} = require('../../../lib/wca');
const Team = require('../models/team');
const TeamView = require('../components/team');
const WeekSelector = require('../components/weekSelector');


module.exports = React.createClass({
	displayName: 'TeamPage',
	mixins: [ampersandReactMixin],

	getInitialState () {
		return {
			editing: false
		};
	},

	getDefaultProps () {
		return {
		};
	},

	render () {
		let {week, team} = this.props;

		return (
			<div className='container'>
				<Segment>
					<h2>{team.name}</h2>
					<div>
						<Segment basic>
							<WeekSelector week={week} last={() => app.router.history.navigate(`/teams/${team.id}?week=${week - 1}`)} next={() => app.router.history.navigate(`/teams/${team.id}?week=${week + 1}`)}/>
						</Segment>
						<TeamView team={team}/>
					</div>
				</Segment>
			</div>
		);
	}
});
