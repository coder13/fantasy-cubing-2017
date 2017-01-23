const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');
const {Input, Modal, Segment, Menu, Button, Message, Progress, Icon} = require('semantic-ui-react');
const fetch = require('isomorphic-fetch');
const {Events, EventNames, League} = require('../../../lib/wca');
const Team = require('../models/team');
const Week = require('../models/week');
const WeekView = require('../components/week');
const WeekSelector = require('../components/weekSelector');

const EditTeamModal = React.createClass({
	displayName: 'EditTeamModal',

	getDefaultProps () {
		return {
			team: {}
		};
	},

	getInitialState () {
		return {
			value: this.props.team ? this.props.team.name : ''
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

		app.team.save({name: value});

		this.close();
	},

	cancel () {
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
					<Button warning disabled={!value} onClick={this.cancel}>Cancel</Button>
					<Button positive disabled={!value} onClick={this.submit}>Edit</Button>
				</Modal.Actions>
			</Modal>
		);
	}
});

const CreateTeamModal = React.createClass({
	displayName: 'CreateTeamModal',
	mixins: [ampersandReactMixin],

	getInitialState () {
		return {
			value: ''
		};
	},

	submit () {
		app.me.team.save({
			owner: app.me.toJSON(),
			league: 'Standard',
			name: this.state.value
		}, {
			success: function (model, res, options) {
				app.me.team.fetchWeek(app.currentWeek());
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
			loadingTeam: true,
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
		this.setState({
			progress: undefined
		});
		this.getProgress();
	},

	render () {
		let {week, team, canView, canEdit} = this.props;
		let {progress, loadingTeam} = this.state;

		// let url = canEdit ? '/profile/team' : ('/teams/' + team.id);
		let url = window.location.pathname;

		return (
			<div>
				<Segment.Group>
					<Segment>
						<h2>
							{team ? team.name : ''}
							{canEdit ? <small style={{fontSize: '.5em'}}><a href='' onClick={() => this.EditTeamModal.open()}> (edit)</a></small> : null}
						</h2>
					</Segment>
					<Segment>
						<WeekSelector week={week} last={() => app.router.history.navigate(`${url}?week=${week - 1}`, {trigger: true})}
																			next={() => app.router.history.navigate(`${url}?week=${week + 1}`, {trigger: true})}/>
					</Segment>
					{canView ?
						<Segment loading={!progress}>
							{progress ?
								<Progress precision={0} percent={100 * progress.completed / (progress.completed + progress.pending)} size='small'>
								{progress.completed} / {progress.completed + progress.pending} Week {week} Competitions
							</Progress> : <Progress size='small'/>}
						</Segment>
					: null}
					{canView ?
						<Segment compact loading={team && !team.weeks[week]}>
								<WeekView week={team ? team.weeks[week] : null} editable={canEdit && week >= app.currentWeek() || app.me.isAdmin}/>
						</Segment> :
						<Segment as={Message}>
							<Icon name='warning'/>
							Cannot view team for week {week} until deadline is over
						</Segment>
					}
				</Segment.Group>

				{canEdit ?
					<div>
						{!(team && team.id) ? <CreateTeamModal/> : null}
						<EditTeamModal team={team} ref={ref => {this.EditTeamModal = ref;}}/>
					</div>
					: null
				}
			</div>
		);
	}
});
