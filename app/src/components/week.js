const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');
const {Form, Grid, Button, Label, Message, Modal, Table, Select, Search, Segment, Header} = require('semantic-ui-react');
const xhr = require('xhr');
const {Events, EventNames, League, Input} = require('../../../lib/wca');
const {season, getClasses} = require('../../../lib/rules');
const Team = require('../models/team');

const prettyfy = (x) => !x ? 0 : x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const SelectPersonModal = React.createClass({
	displayName: 'SelectPersonModal',

	getInitialState () {
		return {
			isLoading: false,
			showModal: false,
			eventId: '',
			group: 0,
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

	open (group, slot) {
		this.setState({showModal: true, group, slot});
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
		const {isLoading, group, eventId, slot, value, showModal, results} = this.state;
		// let c = slot < 2 ? 0 : slot < 6 ? 1 : 2;
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
							<Select className='eventSelect' value={eventId} onChange={this.changeEvent} options={this.props.classes[group].events.map((e,i) => ({value: e, text: EventNames[e]}))}/>
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

	openChangePersonModal (group, slot) {
		this.modals.selectPersonModal.open(group, slot);
	},

	handleSelectPerson (slot, cuber, eventId) {
		this.props.team.setPick(slot, cuber, eventId);
	},

	render () {
		let {editable, week, team} = this.props;
		let exists = team && team.picks && team.picks.length > 0;
		let classes = getClasses(week);
		let findCuber = (slot) => team.picks.find(c => c.slot === slot);
		let totalPoints = exists ? +Number(_(team.picks).map(p => p.points || 0).sum()).toFixed(2) : 0;
		let counting = pick => {
			let pickClass = classes.find(clas => clas.events.indexOf(pick.eventId) > -1);
			let picks =  team.picks.filter(member => pickClass.events.indexOf(member.eventId) > -1).sort((a,b) => a.points < b.points).slice(0, -1).filter(p => !!p.points);
			return !!picks.find(p => p.personId === pick.personId);
		};

		let personRow = (group, slot) => {
			let cuber = exists ? findCuber(slot) : false;

			return (
				<Table.Row key={slot} className={`cuberRow ${counting(cuber) ? 'countingPick' : ''}`}>
					<Table.Cell>{cuber ? EventNames[cuber.eventId] : ''}</Table.Cell>
					<Table.Cell>{cuber ? `${cuber.name || 'Unknown'} (${cuber.personId})` : ''}</Table.Cell>
					<Table.Cell>{cuber ? cuber.countryId || 'Unknown' : ''}</Table.Cell>
					<Table.Cell>{cuber ? cuber.points : ''}</Table.Cell>
					{editable ? <Table.Cell><div style={{cursor: 'pointer'}} onClick={() => this.openChangePersonModal(group, slot)}>{exists ? 'Change' : 'Choose'}</div></Table.Cell> : null}
				</Table.Row>
			);
		};

		let s = 0;

		return (
			<div>
				{season(week) === 2 ?
					<Message>
						Season 2 Rules:
						Best n-1 for each class will be chosen
					</Message>
					: null}

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
						{classes.map((group, classIndex) => [
							<Table.Row className='classHeader'>
								<Table.Cell>
									<h4>Class {classIndex + 1}: {group.name}</h4>
								</Table.Cell>
								<Table.Cell colSpan='4'>
									<p>Events: {group.events.map(e => EventNames[e]).join(', ')}</p>
								</Table.Cell>
							</Table.Row>,
							_.times(group.slots, i => personRow(classIndex, s++))
						])}
					</Table.Body>
				</Table>

				<Segment attached textAlign='center'>
					<p>{totalPoints} Total Points</p>
				</Segment>

				{editable ? <SelectPersonModal ref={modal => {this.modals.selectPersonModal = modal;}} classes={classes} submit={this.handleSelectPerson}/> : null}
			</div>
		);
	}
});
