require('react-select/dist/react-select.css');

const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const {Modal, Segment, Button} = require('semantic-ui-react');
const Select = require('react-select');
const ampersandReactMixin = require('ampersand-react-mixin');
const xhr = require('xhr');
const Team = require('../models/team');
const TeamView = require('../components/team');
const {Events, EventNames, League} = require('../../../lib/wca');

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
		let cubers = Object.keys(team.cubers);
		let points = cubers.length > 0 ? cubers.map(i => team.cubers[i].points || 0).reduce((a,b) => a+b) : 0;

		return (
			<div className='container'>
				<h2>{team.name} <small><b>{team.ELO}</b> <span title='Wins-Losses-Ties'>({team.wins}-{team.losses}-{team.ties})</span></small></h2>
				<br/>
				<div>
					<Segment basic>
						<Button.Group>
							<Button labelPosition='left' content='Last Week' icon='left chevron' onClick={() => app.router.history.navigate(`/teams/${team.id}?week=${week - 1}`)}/>
							<Button labelPosition='right' content = 'Next Week' icon='right chevron' onClick={() => app.router.history.navigate(`/teams/${team.id}?week=${week + 1}`)}/>
						</Button.Group>
						<span>Week: {week} Points: {points}</span>

					</Segment>
				</div>
				<div>
					<TeamView team={team}/>
				</div>
			</div>
		);
	}
});
