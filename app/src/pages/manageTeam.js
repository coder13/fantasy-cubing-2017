require('react-select/dist/react-select.css');

const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const {Modal, Button} = require('react-bootstrap');
const Select = require('react-select');
const ampersandReactMixin = require('ampersand-react-mixin');
const xhr = require('xhr');
const Team = require('../models/team');
const {Events, League} = require('../lib/wca');

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
			name: this.state.value
		});
		team.save();
		app.me.teams.push(team);
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
				<Modal.Header>
					<Modal.Title>Create Team</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<h5>Team Name:</h5>
					<br/>
					<input type='text' className='form-control' value={value} onChange={this.onChange}/>
				</Modal.Body>

				<Modal.Footer>
					<Button bsStyle='primary' disabled={!value} onClick={this.submit}>Create</Button>
				</Modal.Footer>
			</Modal>
		);
	}
});

const SelectPersonModal = React.createClass({
	displayName: 'SelectPersonModal',

	getInitialState () {
		return {
			showModal: false,
			eventId: '333',
			slot: 0,
			value: ''
		};
	},

	submit () {
		if (this.props.submit) {
			this.props.submit(this.state.eventId, this.state.slot, this.state.value.value);
		}
		this.setState(this.getInitialState())
		// this.closeModal();
	},

	getCubers (input, cb) {
		xhr.get(`${app.apiURL}/search/people/${input}`, (error, res, body) => {
			cb(null, {
				options: _.uniqBy(JSON.parse(body).map(i => ({value: i.id, label: i.name + ` (${i.id})`})), 'value'),
				complete:  true
			});
		});
	},

	open (eventId, slot) {
		this.setState({showModal: true, eventId, slot});
	},

	closeModal () {
		this.setState({showModal: false});
	},

	change (value) {
		this.setState({value})
	},

	render() {
		const {eventId, slot, value} = this.state;

		return (
			<Modal show={this.state.showModal} onHide={this.closeModal}>
				<Modal.Header>
					<Modal.Title>Select Cuber</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<h5>Select cuber for {eventId} slot {slot+1}</h5>
					<br/>
					<Select.Async name='name' value={value} onChange={this.change} loadOptions={this.getCubers}/>
				</Modal.Body>

				<Modal.Footer>
					<Button bsStyle='primary' onClick={this.submit}>{value ? 'Select' : 'Clear'}</Button>
					<Button onClick={this.closeModal}>Cancel</Button>
				</Modal.Footer>
			</Modal>
			);
	}
});

module.exports = React.createClass({
	displayName: 'ManageTeamPage',
	mixins: [ampersandReactMixin],
	modals: {},

	componentDidMount () {
	},

	getInitialState () {
		return {
			editing: false
		};
	},

	getDefaultProps () {
		return {};
	},

	openChangePersonModal (eventId, slot) {
		this.modals.selectPersonModal.open(eventId, slot);
	},

	handleSelectPerson (eventId, slot, cuber) {
		let team = this.props.me.getTeam('Standard');
		if (team) {
			team.setCuber(eventId, slot, cuber);
		}
	},

	toggleEditing () {
		this.setState({editing: !this.state.editing})
	},

	render () {
		let team = this.props.me.getTeam('Standard');

		return (
			<div className='container'>
				<div className='button-group pull-right'>
				</div>
				<div>
					<table className='table table-bordered'>
						<thead>
							<tr>
								<th width='2em'>Event</th>
								<th width='1em'>Slot</th>
								<th>Name</th>
								<th>WCA ID</th>
								<th>Country</th>
								<th title='Points for the weekend'>Points</th>
								<th width='5em'><span className='glyphicon glyphicon-cog'/></th>
							</tr>
						</thead>
						<tbody>
							{League.map((e) => 
								_.times(e.slots, (i) => {
									let eventTd = i === 0 ? <td rowSpan={e.slots}><b>{Events[e.eventId]}</b></td> : null;
									if (team && team.cubers[`${e.eventId}-${i}`]) {
										return (
											<tr style={{hover: '#dfdfdf'}}>
												{eventTd}
												<td>{i+1}</td>
												<td>{team.cubers[`${e.eventId}-${i}`].name}</td>
												<td>{team.cubers[`${e.eventId}-${i}`].personId}</td>
												<td>{team.cubers[`${e.eventId}-${i}`].countryId}</td>
												<td></td>
												<td><div style={{cursor: 'pointer'}} onClick={() => this.openChangePersonModal(e.eventId, i)}>Change</div></td>
											</tr>
										);
									} else {
										return (
											<tr>
												{eventTd}
												<td>{i+1}</td>
												<td></td>
												<td></td>
												<td></td>
												<td></td>
												<td><div style={{cursor: 'pointer'}} onClick={() => this.openChangePersonModal(e.eventId, i)}>Choose</div></td>
											</tr>
										);
									}
							}))}
						</tbody>
					</table>

				</div>
				<SelectPersonModal ref={(modal) => this.modals.selectPersonModal = modal} submit={this.handleSelectPerson}/>
				{!team || !team.id ? <CreateTeamModal/> : null}
			</div>
		);
	}
});
