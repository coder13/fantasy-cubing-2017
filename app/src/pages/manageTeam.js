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
			<Modal show={true}>
				<Modal.Header>Create Team</Modal.Header>

				<Modal.Content>
					<h5>Team Name:</h5>
					<br/>
					<input type='text' className='form-control' value={value} onChange={this.onChange}/>
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
		return {};
	},

	render () {
		let team = this.props.me.getTeam('Standard');

		return (
			<div className='container'>
				<div className='button-group pull-right'>
				</div>
				<div>
					<TeamView editable={true} team={team}/>
				</div>
				{!team || !team.id ? <CreateTeamModal/> : null}
			</div>
		);
	}
});
