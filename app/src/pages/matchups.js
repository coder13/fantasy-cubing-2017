const app = require('ampersand-app');
const React = require('react');
const {Table} = require('semantic-ui-react');
const ampersandReactMixin = require('ampersand-react-mixin');

module.exports = React.createClass({
	displayName: 'MatchupsPage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {};
	},

	renderMatchups() {
		let {matchups} = this.props;
		console.log(15, matchups.map(i => i))

		return (
			<Table>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Team</Table.HeaderCell>
						<Table.HeaderCell style={{textAlign: 'center', width: '1em'}}>Points</Table.HeaderCell>
						<Table.HeaderCell style={{width: '1em'}}></Table.HeaderCell>
						<Table.HeaderCell style={{textAlign: 'center', width: '1em'}}>Points</Table.HeaderCell>
						<Table.HeaderCell>Team</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{matchups.map((matchup, index) => 
						<Table.Row key={index}>
							<Table.Cell>{matchup.homeTeam.name}</Table.Cell>
							<Table.Cell>0</Table.Cell>
							<Table.Cell>VS</Table.Cell>
							<Table.Cell>0</Table.Cell>
							<Table.Cell>{matchup.awayTeam.name}</Table.Cell>
						</Table.Row>)}
				</Table.Body>
			</Table>
		);
	},

	render () {
		let {matchups} = this.props;

		return (
			<div>
				{matchups.length ? this.renderMatchups() :
					<div>
						<p>No Matchups yet, wait till the start of the weekend.</p>
					</div>
				}
			</div>
		);
	}
});
