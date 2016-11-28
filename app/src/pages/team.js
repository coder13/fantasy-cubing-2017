require('react-select/dist/react-select.css');

const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const {Modal, Button} = require('react-bootstrap');
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
	'feet': 'Feet',
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
	{eventId: 'feet', slots: 1},
	{eventId: 'sq1', slots: 1},
	{eventId: 'pyram', slots: 1},
	{eventId: 'skewb', slots: 1},
	{eventId: 'mega', slots: 1},
	{eventId: 'clock', slots: 1},
	{eventId: '4bld', slots: 1},
	{eventId: '5bld', slots: 1},
	{eventId: 'mbld', slots: 1},
];

module.exports = React.createClass({
	displayName: 'TeamPage',
	mixins: [ampersandReactMixin],
	modals: {},

	getInitialState () {
		return {
			editing: false
		};
	},

	getDefaultProps () {
		return {
			cubers: []
		};
	},

	render () {
		let team = this.props.team;

		return (
			<div className='container'>
				<h2>{team.name} <small><b>{team.ELO}</b> <span title='Wins-Losses-Ties'>({team.wins}-{team.losses}-{team.ties})</span></small></h2>
				<br/>
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
											</tr>
										);
									}
							}))}
						</tbody>
					</table>
				</div>
			</div>
		);
	}
});
