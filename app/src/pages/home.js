const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');
const {Segment, Header, Grid, Table} = require('semantic-ui-react');
const xhr = require('xhr');
const wca = require('../../../lib/wca');

const stats = {
	weeklyMVPs: {
		name: 'Weekly MVPs',
		header: ['Name', 'Country', 'Event', 'Points'],
		row: (row, index) =>
			<Table.Row key={index}>
				<Table.Cell>{row.personName} <small>(<a target='_blank' href={`https://www.worldcubeassociation.org/results/p.php?i=${row.personId}`} className='c-link'>{row.personId}</a>)</small></Table.Cell>
				<Table.Cell>{row.personCountryId}</Table.Cell>
				<Table.Cell>{wca.EventNames[row.eventId]}</Table.Cell>
				<Table.Cell>{row.points}</Table.Cell>
			</Table.Row>
	},
	quickRankings: {
		name: 'Weekly Top 10',
		header: ['Owner', 'Name', 'Points'],
		row: (row, index) =>
			<Table.Row key={index}>
				<Table.Cell>{row.owner}</Table.Cell>
				<Table.Cell>{row.name}</Table.Cell>
				<Table.Cell>{row.points}</Table.Cell>
			</Table.Row>
	}
};

const QuickStat = React.createClass({
	getDefaultProps () {
		return {
			stat: ''
		};
	},

	getInitialState () {
		return {
			data: []
		};
	},

	componentDidMount () {
		this.fetch();
	},

	fetch () {
		if (this.props.stat) {
			xhr.get(`${app.apiURL}/stats/${this.props.stat}`, (err, res, body) => {
				if (res.statusCode === 200) {
					this.setState({
						data: JSON.parse(body)
					});
				} else {
					console.trace(JSON.parse(body));
				}
			});
		}
	},

	render () {
		let {stat} = this.props;
		let {data} = this.state;
		let {name, header, row} = stats[stat];

		return (
			<div>
				<Header content={name}/>
				<Table compact collapsing size='small'>
					<Table.Header>
						<Table.Row>
							{header ? header.map((name, index) =>
								<Table.HeaderCell key={index}>{name}</Table.HeaderCell>
							) : '' }
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{data ? data.map(row) : ''}
					</Table.Body>
				</Table>
			</div>
		);
	}
});


module.exports = React.createClass({
	displayName: 'HomePage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {};
	},

	render () {
		return (
			<div>
				<Header as='h1' textAlign='center' content='Fantasy Cubing' style={{marginBottom: '5vh'}}/>
				<Grid>
					<Grid.Row columns={2}>
						<Grid.Column><QuickStat stat='weeklyMVPs'/></Grid.Column>
						<Grid.Column><QuickStat stat='quickRankings'/></Grid.Column>
					</Grid.Row>
				</Grid>
			</div>
		);
	}
});
