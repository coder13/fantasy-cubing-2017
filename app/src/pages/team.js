const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');
const {Input, Modal, Segment, Menu, Button, Message, Progress, Icon} = require('semantic-ui-react');
const fetch = require('isomorphic-fetch');
const {Events, EventNames, League} = require('../../../lib/wca');
const Team = require('../models/team');
const TeamView = require('../components/team');
const WeekSelector = require('../components/weekSelector');

const EditTeamModal = React.createClass({
	displayName: 'EditTeamModal',

	getDefaultProps () {
		return {};
	},

	getInitialState () {
		return {
			value: ''
		};
	},

	open () {
		this.setState({show: true});
	},

	close () {
		this.setState({show: false});
	},

	submit () {
		let {team} = this.props;
		let {value} = this.state;

		team.save({name: value});

		this.close();
	},

	onChange (eventId) {
		this.setState({
			value: eventId.target.value
		});
	},

	render () {
		const {value, show} = this.state;

		return (
			<Modal size='small' open={show}>
				<Modal.Header>Edit Team</Modal.Header>

				<Modal.Content>
					<h3>Team Name:</h3>
					<br/>
					<Input fluid type='text' value={value} onChange={this.onChange}/>
				</Modal.Content>

				<Modal.Actions>
					<Button positive disabled={!value} onClick={this.submit}>Edit</Button>
				</Modal.Actions>
			</Modal>
		);
	}
});

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
	displayName: 'TeamPage',
	mixins: [ampersandReactMixin],

	getInitialState () {
		return {
			editing: false
		};
	},

	getDefaultProps () {
		return {
			canView: true,
			canEdit: false
		};
	},

	getProgress () {
		let {week} = this.props;

		fetch(`${window.location.origin}${app.apiURL}/stats/weeklyCompProgress?week=${week}`)
			.then(res => {
				if (res.status >= 400) {
					throw new Error(res.json());
				}

				return res.json();
			})
			.then(progress => {
				this.setState({progress});
			});
	},

	componentWillMount () {
		this.getProgress();
	},

	componentWillReceiveProps (props) {
		this.props = props;
		this.getProgress();
	},

	render () {
		let {week, team, canView, canEdit} = this.props;
		let {progress} = this.state;

		let url = canEdit ? '/profile/team' : ('/teams/' + team.id);

		return (
			<div>
				<Segment>
					<h2>
						{team ? team.name : ''}
						{canEdit ? <small style={{fontSize: '.5em'}}><a href='' onClick={() => this.EditTeamModal.open()}> (edit)</a></small> : null}
					</h2>
					<div>
						<Segment.Group>
							<Segment>
								<WeekSelector week={week} last={() => app.router.history.navigate(`${url}?week=${week - 1}`)} next={() => app.router.history.navigate(`${url}?week=${week + 1}`)}/>
							</Segment>
							{canView ?
								<Segment>
									{progress ?
										<Progress value={progress.completed} size='small' total={progress.pending + progress.pending}>
										{progress.completed} / {progress.completed + progress.pending} Week {week} Competitions
									</Progress> : <Progress/>}
								</Segment>
							: null}
							{canView ?
								<Segment loading={!team}>
										<TeamView team={team} editable={canEdit && week >= app.currentWeek()}/>
								</Segment> :
								<Segment as={Message}>
									<Icon name='warning'/>
									Cannot view team for week {week} until deadline is over
								</Segment>
							}
						</Segment.Group>
					</div>
				</Segment>

				{canEdit ?
					<div>
						{!team || !team.id ? <CreateTeamModal/> : null}
						<EditTeamModal team={team} ref={ref => {this.EditTeamModal = ref;}}/>
					</div>
					: null
				}
			</div>
		);
	}
});
