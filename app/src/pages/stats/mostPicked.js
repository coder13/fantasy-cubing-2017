const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');
const {Segment, Menu, Table, Container, Message} = require('semantic-ui-react');
const CubeIcon = require('../../components/cubeIcon');
const wca = require('../../../../lib/wca');

const prettyfy = (x) => !x ? 0 : x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

module.exports = React.createClass({
	displayName: 'MostPickedPage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {
			week: 1
		};
	},

	getInitialState() {
		return {
			data: [],
			messages: []
		};
	},

	componentWillReceiveProps(props) {
		this.props = props;
		this.state.messages = [];
		this.getData();
	},

	componentWillMount () {
		this.getData();
	},

	getData () {
		let self = this;

		fetch(`${app.apiURL}/stats/mostPicked?week=${this.props.week}&limit=${this.props.limit || 100}`)
		.then(data => data.json()).then(function (data) {
			if (data.statusCode >= 400) {

				self.state.messages.push(data);
				self.setState({data: []});
			} else {
				self.setState({data});
			}
		});
	},

	render () {
		let {active, week} = this.props;
		let {data, messages} = this.state;

		let lastPicks = 0;
		let lastRank = 0;
		let rank = 0;

		let disabledNext = (week + 1) === app.currentWeek();

		return (
			<div>
				<h1>Most Picked</h1>
				<Menu pagination>
					<Menu.Item icon='left chevron' onClick={() => app.router.history.navigate(`/stats/mostPicked?week=${week - 1}`)}/>
					<Menu.Item disabled name={`Week: ${week}`}/>
					<Menu.Item disabled={disabledNext} icon='right chevron' onClick={() => app.router.history.navigate(`/stats/mostPicked?week=${week + 1}`)}/>
				</Menu>

				<Container id='alerts'>
					{messages.map(message =>
						<Message negative>
							<p>{message.message}</p>
						</Message>
					)}
				</Container>

				<Table>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Rank</Table.HeaderCell>
							<Table.HeaderCell>Name</Table.HeaderCell>
							<Table.HeaderCell>Country</Table.HeaderCell>
							<Table.HeaderCell>Event</Table.HeaderCell>
							<Table.HeaderCell>Picks</Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						{data.map((pick, index)=> {
							let rank = index + 1;
							if (pick.picks === lastPicks) {
								rank = lastRank;
							}

							lastRank = rank;
							lastPicks = pick.picks;

							return (
								<Table.Row key={index}>
									<Table.Cell>{rank}</Table.Cell>
									<Table.Cell>{pick.name} ({pick.personId})</Table.Cell>
									<Table.Cell>{pick.countryId}</Table.Cell>
									<Table.Cell><CubeIcon name={pick.eventId}/> {wca.EventNames[pick.eventId]}</Table.Cell>
									<Table.Cell>{pick.picks}</Table.Cell>
								</Table.Row>
							);
						})}
					</Table.Body>
				</Table>
			</div>
		);
	}
});
