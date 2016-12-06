require('react-select/dist/react-select.css');

const _ = require('lodash');
const app = require('ampersand-app');
const React = require('react');
const {Modal, Button} = require('react-bootstrap');
const Select = require('react-select');
const ampersandReactMixin = require('ampersand-react-mixin');
const xhr = require('xhr');
const Team = require('../models/team');
const {Events, EventNames, League} = require('../../../lib/wca');

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
		};
	},

	render () {
		let {week, team} = this.props;

		return (
			<div className='container'>
				<h2>{team.name} <small><b>{team.ELO}</b> <span title='Wins-Losses-Ties'>({team.wins}-{team.losses}-{team.ties})</span></small></h2>
				<br/>
				<div>
					<div className='btn-toolbar' style={{paddingBottom: '10px'}}>
						<div className='btn-group'>
							<button className='btn btn-default' onClick={() => app.router.history.navigate(`/teams/${team.id}?week=${week - 1}`)}>
								<span className='glyphicon glyphicon-chevron-left'/>
							</button>
							<button className='btn btn-default' onClick={() => app.router.history.navigate(`/teams/${team.id}?week=${week + 1}`)}>
								<span className='glyphicon glyphicon-chevron-right'/>
							</button>
						</div>
						<span className='btn-group'>Week: {week}</span>
					</div>
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
							</tr>
						</thead>
						<tbody>
							{League.map((e) =>
								_.times(e.slots, (i) => {
									let eventTd = i === 0 ? <td rowSpan={e.slots}><b>{EventNames[e.eventId]}</b></td> : null;
									if (team && team.cubers[`${e.eventId}-${i}`]) {
										return (
											<tr style={{hover: '#dfdfdf'}}>
												{eventTd}
												<td>{i+1}</td>
												<td>{team.cubers[`${e.eventId}-${i}`].name}</td>
												<td>{team.cubers[`${e.eventId}-${i}`].personId}</td>
												<td>{team.cubers[`${e.eventId}-${i}`].countryId}</td>
												<td>{team.cubers[`${e.eventId}-${i}`].points}</td>
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
