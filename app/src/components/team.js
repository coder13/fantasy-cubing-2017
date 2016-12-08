require('react-select/dist/react-select.css');

const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const Select = require('react-select');
const ampersandReactMixin = require('ampersand-react-mixin');
const {Button, Modal, Table} = require('semantic-ui-react');
const xhr = require('xhr');
const Team = require('../models/team');
const {Events, EventNames, League} = require('../../../lib/wca');

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
	},

	getCubers (input, cb) {
		xhr.get(`${app.apiURL}/search/people/${input}?eventId=${this.state.eventId}`, (error, res, body) => {
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
		const {eventId, slot, value, showModal} = this.state;

		return (
			<Modal open={showModal}>
				<Modal.Header>Select Cuber</Modal.Header>

				<Modal.Content>
					<h5>Select cuber for {eventId} slot {slot+1}</h5>
					<br/>
					<Select.Async name='name' value={value} onChange={this.change} loadOptions={this.getCubers}/>
				</Modal.Content>

				<Modal.Actions>
					<Button positive onClick={this.submit}>{value ? 'Select' : 'Clear'}</Button>
					<Button onClick={this.closeModal}>Cancel</Button>
				</Modal.Actions>
			</Modal>
		);
	}
});

module.exports = React.createClass({
	displayName: 'Team',
	mixins: [ampersandReactMixin],
	modals: {},

	getInitialState () {
		return {
			editing: false
		};
	},

	getDefaultProps () {
		return {
			editable: false
		};
	},

	openChangePersonModal (eventId, slot) {
		this.modals.selectPersonModal.open(eventId, slot);
	},

	handleSelectPerson (eventId, slot, cuber) {
		this.props.team.setCuber(eventId, slot, cuber);
	},

	render () {
		let {editable, team} = this.props;

		return (
			<Table celled selectable>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Event</Table.HeaderCell>
						<Table.HeaderCell>Slot</Table.HeaderCell>
						<Table.HeaderCell>Name</Table.HeaderCell>
						<Table.HeaderCell>WCA ID</Table.HeaderCell>
						<Table.HeaderCell>Country</Table.HeaderCell>
						<Table.HeaderCell style={{width: '1em'}} title='Points for the weekend'>Points</Table.HeaderCell>
						{editable ? <Table.HeaderCell/> : null}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{League.map((e) =>
						_.times(e.slots, (i) => {
							let eventTd = i === 0 ? <Table.Cell rowSpan={e.slots}><b>{EventNames[e.eventId]}</b></Table.Cell> : null;
							if (team && team.cubers[`${e.eventId}-${i}`]) {
								return (
									<Table.Row>
										{eventTd}
										<Table.Cell>{i+1}</Table.Cell>
										<Table.Cell>{team.cubers[`${e.eventId}-${i}`].name}</Table.Cell>
										<Table.Cell>{team.cubers[`${e.eventId}-${i}`].personId}</Table.Cell>
										<Table.Cell>{team.cubers[`${e.eventId}-${i}`].countryId}</Table.Cell>
										<Table.Cell>{team.cubers[`${e.eventId}-${i}`].points}</Table.Cell>
										{editable ? <Table.Cell><div style={{cursor: 'pointer'}} onClick={() => this.openChangePersonModal(e.eventId, i)}>Change</div></Table.Cell> : null}
									</Table.Row>
								);
							} else {
								return (
									<Table.Row>
										{eventTd}
										<Table.Cell>{i+1}</Table.Cell>
										<Table.Cell></Table.Cell>
										<Table.Cell></Table.Cell>
										<Table.Cell></Table.Cell>
										<Table.Cell></Table.Cell>
										{editable ? <Table.Cell><div style={{cursor: 'pointer'}} onClick={() => this.openChangePersonModal(e.eventId, i)}>Choose</div></Table.Cell> : null}
									</Table.Row>
								);
							}
					}))}
				</Table.Body>
				{editable ? <SelectPersonModal ref={(modal) => this.modals.selectPersonModal = modal} submit={this.handleSelectPerson}/> : null}
			</Table>
		);
	}
});
