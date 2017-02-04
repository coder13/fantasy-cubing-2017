const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');
const {Form, Grid, Button, Label, Modal, Table, Select, Search, Segment, Header} = require('semantic-ui-react');
const xhr = require('xhr');
const {Events, EventNames, League, Input} = require('../../../lib/wca');
const Team = require('../models/team');

const prettyfy = (x) => !x ? 0 : x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

let classes = [{
	slots: 2,
	events: ['333']
}, {
	slots: 4,
	events: ['444', '555', '222', 'skewb', 'pyram', '333oh', '333bf']
}, {
	slots: 4,
	events: ['333fm', '333ft', 'minx', 'sq1', 'clock', '666', '777', '444bf', '555bf', '333mbf']
}];

const SelectPersonModal = React.createClass({
	displayName: 'SelectPersonModal',

	getInitialState () {
		return {
			isLoading: false,
			showModal: false,
			eventId: '',
			slot: 0,
			value: '',
			results: []
		};
	},

	submit () {
		if (this.props.submit) {
			this.props.submit(this.state.slot, this.state.value, this.state.eventId);
		}

		this.closeModal();
	},

	getPicks (value, cb) {
		xhr.get(`${app.apiURL}/search/people/${value}${this.state.eventId ? `?eventId=${this.state.eventId}` : ''}`, (error, res, body) => {
			cb(null, _.uniqBy(JSON.parse(body), 'personId').map(cuber => ({
				title: cuber.personId,
				description: `${cuber.personName}`
			})));
		});
	},

	open (slot) {
		this.setState({showModal: true, slot});
	},

	closeModal () {
		this.setState(this.getInitialState());
	},

	select (e, result) {
		this.setState({value: result.title});
	},

	change (e, value) {
		this.setState({isLoading: true, value});

		this.getPicks(value, (err, results) => {
			this.setState({isLoading: false, results: results});
		});
	},

	changeEvent (raw, e) {
		this.setState({
			isLoading: true,
			eventId: e.value
		});

		this.getPicks(this.state.value, (err, results) => {
			this.setState({isLoading: false, results: results});
		});
	},

	render() {
		const {isLoading, eventId, slot, value, showModal, results} = this.state;
		let c = slot < 2 ? 0 : slot < 6 ? 1 : 2;
		let canSelect = !!value && !!eventId;

		return (
			<Modal open={showModal} size='small'>
				<Modal.Header>Select Cuber</Modal.Header>

				<Modal.Content>
					<h4>Select Cuber For Slot {slot + 1}</h4>
					<br/>

					<Form>
						<Form.Field inline>
							<label>Event: </label>
							<Select className='eventSelect' value={eventId} onChange={this.changeEvent} options={classes[c].events.map((e,i) => ({value: e, text: EventNames[e]}))}/>
						</Form.Field>
						<Form.Field inline>
							<label>Name: </label>
							<Form as={Search} fluid loading={isLoading} onResultSelect={this.select} onSearchChange={this.change} results={results} value={value}/>
						</Form.Field>
					</Form>
				</Modal.Content>

				<Modal.Actions>
					<Button positive={canSelect} onClick={this.submit} color={canSelect ? 'green' : 'orange'}>{canSelect ? 'Select' : 'Clear'}</Button>
					<Button onClick={this.closeModal}>Cancel</Button>
				</Modal.Actions>
			</Modal>
		);
	}
});

module.exports = React.createClass({
	displayName: 'Week',
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

	componentWillReceiveProps (props) {
		this.props = props;
	},

	openChangePersonModal (slot) {
		this.modals.selectPersonModal.open(slot);
	},

	handleSelectPerson (slot, cuber, eventId) {
		this.props.week.setPick(slot, cuber, eventId);
	},

	render () {
		let {editable, week} = this.props;
		let exists = week && week.picks && week.picks.length > 0;
		let findCuber = (slot) => week.picks.find(c => c.slot === slot);
		let totalPoints = exists ? +Number(_(week.picks).map(p => p.points).sum()).toFixed(2) : 0;

		let personRow = (slot) => {
			let cuber = exists ? findCuber(slot) : false;

			return (
				<Table.Row key={slot} className='cuberRow'>
					<Table.Cell>{cuber ? EventNames[cuber.eventId] : ''}</Table.Cell>
					<Table.Cell>{cuber ? `${cuber.name || 'Unknown'} (${cuber.personId})` : ''}</Table.Cell>
					<Table.Cell>{cuber ? cuber.countryId || 'Unknown' : ''}</Table.Cell>
					<Table.Cell>{cuber ? cuber.points : ''}</Table.Cell>
					{editable ? <Table.Cell><div style={{cursor: 'pointer'}} onClick={() => this.openChangePersonModal(slot)}>{exists ? 'Change' : 'Choose'}</div></Table.Cell> : null}
				</Table.Row>
			);
		};

		return (
			<div>
				<Table celled structured attached='top'>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell className='cubersHeaderCell'>Event</Table.HeaderCell>
							<Table.HeaderCell className='cubersHeaderCell'>Name</Table.HeaderCell>
							<Table.HeaderCell className='cubersHeaderCell'>Country</Table.HeaderCell>
							<Table.HeaderCell className='cubersHeaderCell' style={{width: '1em'}} title='Points for the weekend'>Points</Table.HeaderCell>
							{editable ? <Table.HeaderCell selectable className='cubersHeaderCell'/> : null}
						</Table.Row>
					</Table.Header>

					<Table.Body>
						<Table.Row className='classHeader'>
							<Table.Cell>
								<h4>Class 1: 3x3</h4>
							</Table.Cell>
							<Table.Cell colSpan='4'>
								<p>Events: {classes[0].events.map(i => EventNames[i]).join(', ')}</p>
							</Table.Cell>
						</Table.Row>

						{_.times(classes[0].slots, (i) =>
							personRow(i)
						)}

						<Table.Row className='classHeader'>
							<Table.Cell>
								<h4>Class 2: Main Events</h4>
							</Table.Cell>
							<Table.Cell colSpan='4'>
								<p>Events: {classes[1].events.map(i => EventNames[i]).join(', ')}</p>
							</Table.Cell>
						</Table.Row>

						{_.times(classes[1].slots, (i) =>
							personRow(2 + i)
						)}

						<Table.Row className='classHeader'>
							<Table.Cell>
								<h4>Class 3: Side Events</h4>
							</Table.Cell>
							<Table.Cell colSpan='4'>
								<p>Events: {classes[2].events.map(i => EventNames[i]).join(', ')}</p>
							</Table.Cell>
						</Table.Row>

						{_.times(classes[2].slots, (i) =>
							personRow(6 + i)
						)}

					</Table.Body>
				</Table>

				<Segment attached textAlign='center'>
					<p>{totalPoints} Total Points</p>
				</Segment>

				{editable ? <SelectPersonModal ref={modal => {this.modals.selectPersonModal = modal;}} submit={this.handleSelectPerson}/> : null}
			</div>
		);
	}
});
