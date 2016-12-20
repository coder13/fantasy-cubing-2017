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
			<div>
				<Table compact selectable>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Owner</Table.HeaderCell>
							<Table.HeaderCell>Team</Table.HeaderCell>
							<Table.HeaderCell style={{textAlign: 'center', width: '1em'}}>Total Points</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{teams.models.sort((a,b) => -compare(a.points, b.points)).map((team, index) =>
							<Table.Row key={index}>
								<Table.Cell>{team.ownerName}</Table.Cell>
								<Table.Cell><a href={`/teams/${team.id}`}>{team.name}</a></Table.Cell>
								<Table.Cell>{team.points}</Table.Cell>
							</Table.Row>)}
					</Table.Body>
				</Table>
			</div>
		);
	}
});
