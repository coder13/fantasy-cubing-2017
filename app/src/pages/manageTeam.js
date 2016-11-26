require('react-select/dist/react-select.css');

const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const {Modal, Button, FormGroup, ControlLabel, FormControl, HelpBlock} = require('react-bootstrap');
const Select = require('react-select');
const ampersandReactMixin = require('ampersand-react-mixin');
const xhr = require('xhr');
const Team = require('../models/team');

const Events = {
	'222': '2x2',
	'333': '3x3',
	'444': '4x4',
	'555': '5x5',
	'666': '6x6',
	'777': '7x7',
	'333oh': 'OH',
	'3bld': '3BLD',
	'fmc': 'FMC',
	'sq1': 'SQ-1',
	'pyram': 'Pyraminx',
	'skewb': 'Skewb',
	'mega': 'Megaminx',
	'clock': 'Clock',
	'4bld': '4BLD',
	'5bld': '5BLD',
	'5bld': '5BLD',
	'mbld': 'MBLD',
};

const League = [
	{eventId: '333', slots: 3},
	{eventId: '222', slots: 2},
	{eventId: '444', slots: 2},
	{eventId: '555', slots: 2},
	{eventId: '333oh', slots: 2},
	{eventId: '3bld', slots: 2},
	{eventId: '666', slots: 1},
	{eventId: '777', slots: 1},
	{eventId: 'fmc', slots: 1},
	{eventId: 'sq1', slots: 1},
	{eventId: 'pyram', slots: 1},
	{eventId: 'skewb', slots: 1},
	{eventId: 'mega', slots: 1},
	{eventId: 'clock', slots: 1},
	{eventId: '4bld', slots: 1},
	{eventId: '5bld', slots: 1},
	{eventId: 'mbld', slots: 1},
];

const CreateTeamModal = React.createClass({
	displayName: 'CreateTeamModal',

	getInitialState () {
		return {
			value: ''
		};
	},

	submit () {
		app.me.team.save({
			name: this.state.value
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
		xhr.get(`https://www.worldcubeassociation.org/api/v0/search/users?persons_table=true&q=${input}`, (error, res, body) => {
			cb(null, {
				options: _.uniqBy(JSON.parse(body).result.map(i => ({value: i.wca_id, label: i.name + ` (${i.wca_id})`})), 'value'),
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
					<Button bsStyle='primary' disabled={!value} onClick={this.submit}>Select</Button>
					<Button onClick={this.closeModal}>Cancel</Button>
				</Modal.Footer>
			</Modal>
			);
	}
});

module.exports = React.createClass({
	displayName: 'HomePage',
	mixins: [ampersandReactMixin],
	modals: {},

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
		app.me.team.setCuber(eventId, slot, cuber);
	},

	toggleEditing () {
		this.setState({editing: !this.state.editing})
	},

	render () {
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
									if (app.me.team && app.me.team.cubers[`${e.eventId}-${i}`]) {
										return (
											<tr style={{hover: '#dfdfdf'}}>
												{eventTd}
												<td>{i+1}</td>
												<td>{app.me.team.cubers[`${e.eventId}-${i}`].name}</td>
												<td>{app.me.team.cubers[`${e.eventId}-${i}`].personId}</td>
												<td>{app.me.team.cubers[`${e.eventId}-${i}`].countryId}</td>
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
				{!app.me.team || !app.me.team.id ? <CreateTeamModal/> : null}
			</div>
		);
	}
});
