const app = require('ampersand-app');
const React = require('react');
const Chalk = require('chalk');
const ampersandReactMixin = require('ampersand-react-mixin');
const {Segment, Table, Dimmer, Loader, Message} = require('semantic-ui-react');
const CubeIcon = require('../../components/cubeIcon');
const wca = require('../../../../lib/wca');

const prettyfy = (x) => !x ? 0 : x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const fixed = n => Number(n).toFixed(2);

let pad = (n) => (n < 10 ? '0' : '') + n;
const formatResult = function (eventId, result, average) {
	if (result === -2) {
		return 'DNS';
	} else if (result <= 0) {
		return 'DNF';
	} else if (eventId === '333fm' && !average) {
		return result;
	} else {
		let minutes = Math.floor(((result / 100) % 3600) / 60);
		let seconds = fixed((result / 100) % 60);
		return `${minutes ? minutes + ':' : ''}${minutes ? pad(seconds, '0') : seconds}`;
	}
};

const formatAvg = (eventId, formatId, times) => {
	if (formatId === 'a' && _.countBy(times, n => n !== 0).true === 5) {
		let worst =  times.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
		let best = times.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);
		return times.map((time, index) => index === worst || index === best ? `(${formatResult(eventId, time)})` : formatResult(eventId, time)).join(', ');
	} else {
		return _(times.slice(0, wca.Formats[formatId].times)).takeWhile(n => n !== 0).map((time, index) => formatResult(eventId, time)).value().join(', ');
	}
};

const renderPoints = (points) => {
	let color = 'black';
	// if (points < 50) {
	// 	color = 'red';
	// } else if (points < 70) {
	// 	color = 'orange';
	// } else if (points < 90) {
	// 	color = 'green';
	// } else {
	// 	color = 'blue';
	// }

	return (
		<span style={{color}}>{points}</span>
	);
};

const Event = function (props) {
	let eventName = wca.EventNames[props.id];

	let previousComp = '';

	let pbSingleTime;
	let pbAverageTime;

	let pbs = props.results.reverse().map((result, index) => {
		let pbSingle = false;
		if (!pbSingleTime || result.single.time < pbSingleTime) {
			pbSingle = true;
			pbSingleTime = result.single.time;
		}

		let pbAverage = false;
		if (!pbAverageTime || result.average.time < pbAverageTime) {
			pbAverage = true;
			pbAverageTime = result.average.time;
		}

		return {
			single: pbSingle && pbSingleTime,
			average: pbAverage && pbAverageTime
		};
	});

	pbs.reverse();
	props.results.reverse();

	return (
		<Segment>
			<Segment attached='top'>
				<h3><CubeIcon name={props.id}/> {eventName}</h3>
			</Segment>
			<Table attached='bottom' size='small'>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Competition</Table.HeaderCell>
						<Table.HeaderCell>Round</Table.HeaderCell>
						<Table.HeaderCell>Place</Table.HeaderCell>
						<Table.HeaderCell>Best</Table.HeaderCell>
						<Table.HeaderCell>Best Points</Table.HeaderCell>
						<Table.HeaderCell>Average</Table.HeaderCell>
						<Table.HeaderCell>Average Points</Table.HeaderCell>
						<Table.HeaderCell>Total Points</Table.HeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{props.results.map((result, index) => {
						let {average, single, competition, roundId, pos, formatId} = result;
						let newComp = competition.name !== previousComp;
						let compName = newComp ? competition.name : '';
						previousComp = competition.name;

						let round = wca.Rounds[roundId];

						let singlePointsSplit = `(${single.worldPoints} + ${single.continentPoints} + ${single.countryPoints}) / 3`;
						let averagePointsSplit = `(${average.worldPoints} + ${average.continentPoints} + ${average.countryPoints}) / 3`;
						let totalPointsSplit = `(${fixed(single.worldPoints + average.worldPoints) / 2} + ${fixed(single.continentPoints + average.continentPoints) / 2} + ${fixed(single.countryPoints + average.countryPoints) / 2}) / 3`;

						let averageTimes = formatAvg(props.id, formatId, average.times);

						return (
							<Table.Row style={{color: newComp ? '#000' : '#AAA'}} key={index}>
								<Table.Cell>{compName}</Table.Cell>
								<Table.Cell>{round.name}</Table.Cell>
								<Table.Cell>{pos}</Table.Cell>
								<Table.Cell style={{color: pbs[index].single ? 'green' : '#000'}}>{formatResult(props.id, single.time)}</Table.Cell>
								<Table.Cell title={singlePointsSplit}><b>{renderPoints(single.totalPoints)}</b></Table.Cell>
								<Table.Cell style={{color: pbs[index].average ? 'green' : '#000'}} title={averageTimes}>{formatResult(props.id, average.time, true)}</Table.Cell>
								<Table.Cell title={averagePointsSplit}><b>{renderPoints(average.totalPoints)}</b></Table.Cell>
								<Table.Cell title={totalPointsSplit}><b>{renderPoints(fixed((single.totalPoints + result.average.totalPoints) / 2))}</b></Table.Cell>
							</Table.Row>
						);
					})}
				</Table.Body>
			</Table>
		</Segment>
	);
};

module.exports = React.createClass({
	displayName: 'CuberStatsPage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {
			personId: ''
		};
	},

	getInitialState() {
		return {
			results: undefined,
			person: undefined,
			error: undefined
		};
	},

	componentWillReceiveProps(props) {
		this.props = props;
		this.getData();
	},

	componentWillMount () {
		this.getData();
	},

	getData () {
		let self = this;

		fetch(`${app.apiURL}/cubers/${this.props.personId}`)
		.then(data => data.json()).then(function (data) {
			if (data.statusCode && data.statusCode >= 400) {
				self.setState({
					error: 'Cound not find person'
				});
			} else {
				self.setState({
					results: data.results,
					person: data.person
				});
			}
		});
	},

	renderPerson () {
		let {results, person} = this.state;
		let {id, name, countryId} = person;
		let comps = _(results).map(r => r.competition.id).uniq().value().length;
		let medals = _(results).filter(r => wca.Rounds[r.roundId].final).countBy('pos').value();

		return (
			<Table basic='very' size='small'>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>WCA ID</Table.HeaderCell>
						<Table.HeaderCell>Country</Table.HeaderCell>
						<Table.HeaderCell>Competitions</Table.HeaderCell>
						<Table.HeaderCell>Gold</Table.HeaderCell>
						<Table.HeaderCell>Silver</Table.HeaderCell>
						<Table.HeaderCell>Bronze</Table.HeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					<Table.Row>
						<Table.Cell>{id}</Table.Cell>
						<Table.Cell>{countryId}</Table.Cell>
						<Table.Cell>{comps}</Table.Cell>
						<Table.Cell>{(medals[3] || 0).toString()}</Table.Cell>
						<Table.Cell>{(medals[2] || 0).toString()}</Table.Cell>
						<Table.Cell>{(medals[1] || 0).toString()}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table>
		);
	},

	renderPBs () {
		let {results} = this.state;
		let events = results ? _(results).groupBy('eventId').value() : [];

		return (
			<Table basic='very' size='small'>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Event</Table.HeaderCell>
						<Table.HeaderCell title='Country Points'>NP</Table.HeaderCell>
						<Table.HeaderCell title='Continent Points'>CP</Table.HeaderCell>
						<Table.HeaderCell title='World Points'>WP</Table.HeaderCell>
						<Table.HeaderCell>Single</Table.HeaderCell>
						<Table.HeaderCell>Average</Table.HeaderCell>
						<Table.HeaderCell title='World Points'>WP</Table.HeaderCell>
						<Table.HeaderCell title='Continent Points'>CP</Table.HeaderCell>
						<Table.HeaderCell title='Country Points'>NP</Table.HeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
				{wca.Events.map((eventId, index) => {
					let event = events[eventId];

					if (!event) {
						return null;
					}

					let pbSingleRow = event.filter(r => r.single.time > 0).sort(r => r.single.time)[0];
					pbSingleRow = pbSingleRow ? pbSingleRow.single : null;

					let pbAverageRow = event.filter(r => r.average.time > 0).sort(r => r.average.time)[0];
					pbAverageRow = pbAverageRow ? pbAverageRow.average : null;

					if (!pbSingleRow && !pbAverageRow) {
						return null;
					}

					return (
						<Table.Row key={index}>
							<Table.Cell><CubeIcon name={eventId}/> {wca.EventNames[eventId]}</Table.Cell>
							<Table.Cell>{renderPoints(pbSingleRow.countryPoints)}</Table.Cell>
							<Table.Cell>{renderPoints(pbSingleRow.continentPoints)}</Table.Cell>
							<Table.Cell>{renderPoints(pbSingleRow.worldPoints)}</Table.Cell>
							<Table.Cell>{formatResult(eventId, pbSingleRow.time)}</Table.Cell>
							<Table.Cell>{pbAverageRow ? formatResult(eventId, pbAverageRow.time, true) : null}</Table.Cell>
							<Table.Cell>{pbAverageRow ? renderPoints(pbAverageRow.worldPoints) : null}</Table.Cell>
							<Table.Cell>{pbAverageRow ? renderPoints(pbAverageRow.continentPoints) : null}</Table.Cell>
							<Table.Cell>{pbAverageRow ? renderPoints(pbAverageRow.countryPoints) : null}</Table.Cell>

						</Table.Row>
					);
				})}
				</Table.Body>
			</Table>
		);
	},

	render () {
		let {active, week, personId} = this.props;
		let {results, person, error} = this.state;

		let events = results ? _(results).groupBy('eventId').value() : [];

		return (
			<div>
				<Dimmer active={!(results || error)}><Loader content='Fetching Results'/></Dimmer>
				{!error ?
					<Segment.Group>
						<Segment>
							<h2>{person ? person.name : personId}</h2>
						</Segment>
						{person ?
							<Segment>
								{this.renderPerson()}
							</Segment>
							: null}
						{results ?
							<Segment>
								{this.renderPBs()}
							</Segment>
							: null}
						{wca.Events.map((eventId, index) => events[eventId] ? <Event key={index} id={eventId} results={events[eventId]}/> : null)}
					</Segment.Group>
				: <Message>{error}</Message>
			}
			</div>
		);
	}
});
