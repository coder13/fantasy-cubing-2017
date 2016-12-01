const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');

let compare = (a,b) => a < b ? -1 : (a > b ? 1 : 0);

module.exports = React.createClass({
	displayName: 'TeamsPage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {};
	},

	render () {
		const {teams} = this.props;

		return (
			<div className='container'>
				<table className='table table-bordered'>
					<thead>
						<tr>
							<th>Team</th>
							<th style={{textAlign: 'center', width: '1em'}}>Points</th>
							<th style={{textAlign: 'center', width: '1em'}}>ELO</th>
							<th style={{textAlign: 'center', width: '5em'}}>W-L-T</th>
						</tr>
					</thead>
					<tbody>
						{teams.models.sort((a,b) => -compare(a.ELO, b.ELO)).map((team, index) => 
							<tr key={index}>
								<td><a href={`/teams/${team.id}`}>{team.name}</a></td>
								<td>0</td>
								<td>{team.ELO}</td>
								<td>{team.wins}-{team.losses}-{team.ties}</td>
							</tr>)}
					</tbody>
				</table>
			</div>
		);
	}
});
