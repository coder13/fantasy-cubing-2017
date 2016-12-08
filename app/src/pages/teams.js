const app = require('ampersand-app');
const React = require('react');
const {Table} = require('semantic-ui-react');
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
				<Table>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Team</Table.HeaderCell>
							<Table.HeaderCell style={{textAlign: 'center', width: '1em'}}>Points</Table.HeaderCell>
							<Table.HeaderCell style={{textAlign: 'center', width: '1em'}}>ELO</Table.HeaderCell>
							<Table.HeaderCell style={{textAlign: 'center', width: '5em'}}>W-L-T</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{teams.models.sort((a,b) => -compare(a.ELO, b.ELO)).map((team, index) => 
							<Table.Row key={index}>
								<Table.Cell><a href={`/teams/${team.id}`}>{team.name}</a></Table.Cell>
								<Table.Cell>0</Table.Cell>
								<Table.Cell>{team.ELO}</Table.Cell>
								<Table.Cell>{team.wins}-{team.losses}-{team.ties}</Table.Cell>
							</Table.Row>)}
					</Table.Body>
				</Table>
			</div>
		);
	}
});
