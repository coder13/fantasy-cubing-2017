const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const {Modal, Segment, Button, Input} = require('semantic-ui-react');
const ampersandReactMixin = require('ampersand-react-mixin');
const xhr = require('xhr');
const {Events, EventNames, League} = require('../../../lib/wca');
const Team = require('../models/team');
const TeamView = require('../components/team');
const WeekSelector = require('../components/weekSelector');
const CubeIcon = require('../components/cubeIcon');

const CreateTeamModal = React.createClass({
	displayName: 'CreateTeamModal',

	getInitialState () {
		return {
			value: ''
		};
	},

	submit () {
		let team = new Team({
			owner: app.me.id,
			league: 'Standard',
			name: this.state.value
		});

		team.save(null, {
			success: function () {
				app.me.teams.add(team);
				app.router.myTeam();
			}
		});
	},

	onChange (eventId) {
		this.setState({
			value: eventId.target.value
		});
	},

	render () {
		const {value} = this.state;

		return (
			<Modal size='small' open={true}>
				<Modal.Header>Create Team</Modal.Header>

				<Modal.Content>
					<h3>Team Name:</h3>
					<br/>
					<Input fluid type='text' value={value} onChange={this.onChange}/>
				</Modal.Content>

				<Modal.Actions>
					<Button positive disabled={!value} onClick={this.submit}>Create</Button>
				</Modal.Actions>
			</Modal>
		);
	}
});

module.exports = React.createClass({
	displayName: 'ManageTeamPage',
	mixins: [ampersandReactMixin],
	modals: {},

	componentDidMount () {},

	getInitialState () {
		return {};
	},

	getDefaultProps () {
		return {
			week: 0
		};
	},

	render () {
		let {week, team} = this.props;
		console.log(team)

		return (
			<div>
				<Segment>
					<h2>{team ? team.name : ''}</h2>
					<div>
						<Segment basic>
							<WeekSelector week={week} last={() => app.router.history.navigate(`/profile/team?week=${week - 1}`)} next={() => app.router.history.navigate(`/profile/team?week=${week + 1}`)}/>
						</Segment>
						<TeamView editable={week === app.currentWeek()} team={team}/>
					</div>
				</Segment>
				{!team || !team.id ? <CreateTeamModal/> : null}
			</div>
		);
	}
});
