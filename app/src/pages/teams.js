const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');

module.exports = React.createClass({
	displayName: 'MatchupsPage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {};
	},

	renderMatchups() {
		return (
			<table className='table table-bordered'>
				<thead>
					<tr>
						<th>Team</th>
						<th style={{textAlign: 'center', width: '1em'}}>Points</th>
					</tr>
				</thead>
				<tbody>
					{app.teams.map((matchup, index) => 
						<tr key={index}>
							<td><a href={`/teams/${team.id}`}>{matchup.homeTeam.name}</a></td>
							<td>0</td>
						</tr>)}
				</tbody>
			</table>
		);
	},

	render () {
		return (
			<div className='container'>
				<table className='table table-bordered'>
					<thead>
						<tr>
							<th>Team</th>
							<th style={{textAlign: 'center', width: '1em'}}>Points</th>
						</tr>
					</thead>
					<tbody>
						{app.teams.map((team, index) => 
							<tr key={index}>
								<td><a href={`/teams/${team.id}`}>{team.name}</a></td>
								<td>0</td>
							</tr>)}
					</tbody>
				</table>
			</div>
		);
	}
});
