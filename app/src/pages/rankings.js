const app = require('ampersand-app');
const xhr = require('xhr');
const React = require('react');
const {Grid, Menu, Table} = require('semantic-ui-react');
const ampersandReactMixin = require('ampersand-react-mixin');

let compare = (a,b) => a < b ? -1 : (a > b ? 1 : 0);

module.exports = React.createClass({
	displayName: 'RankingsPage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {
			view: 'allTime'
		};
	},

	getInitialState () {
		return {};
	},

	componentWillMount() {
		this.request();
	},

	componentWillReceiveProps(props) {
		this.props = props;
		this.request();
	},

	request () {
		const {view} = this.props;
		let week = this.props.week || app.currentWeek();
		let self = this;

		if (view === 'weekly') {
			xhr.get(`${app.apiURL}/stats/weeklyRankings?week=${week}`, function (err, res, body) {
				if (res.statusCode === 200) {
					self.setState({
						teams: JSON.parse(body)
					});
				}
			});
		} else if (view === 'allTime') {
			xhr.get(`${app.apiURL}/stats/rankings`, function (err, res, body) {
				if (res.statusCode === 200) {
					self.setState({
						teams: JSON.parse(body)
					});
				}
			});
		}
	},

	render () {
		const {view} = this.props;

		let week = parseInt(this.props.week);

		let teams = this.state.teams || [];

		return (
			<div>
				<Menu tabular>
					<Menu.Item name='All Time' active={view === 'allTime'} onClick={() => app.router.history.navigate('/rankings', {trigger: true})}/>
					<Menu.Item name='Week' active={view === 'weekly'} onClick={() => app.router.history.navigate(`/rankings?week=${app.currentWeek() - 1}`, {trigger: true})}/>
				</Menu>
				{view === 'weekly' ?
					<Menu pagination>
						<Menu.Item icon='left chevron' onClick={() => app.router.history.navigate(`/rankings?week=${week - 1}`)}/>
						<Menu.Item disabled name={`Week: ${week}`}/>
						<Menu.Item icon='right chevron' onClick={() => app.router.history.navigate(`/rankings?week=${week + 1}`)}/>
					</Menu> : null}
				<Table compact selectable>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Owner</Table.HeaderCell>
							<Table.HeaderCell>Team</Table.HeaderCell>
							<Table.HeaderCell style={{textAlign: 'center', width: '1em'}}>Total Points</Table.HeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{teams.sort((a,b) => -compare(a.points, b.points)).map((team, index) =>
							<Table.Row key={index}>
								<Table.Cell>{team.owner}</Table.Cell>
								<Table.Cell><a href={`/teams/${team.id}${week ? `?week=${week}` : ''}`}>{team.name}</a></Table.Cell>
								<Table.Cell>{team.points}</Table.Cell>
							</Table.Row>)}
					</Table.Body>
				</Table>
			</div>
		);
	}
});
