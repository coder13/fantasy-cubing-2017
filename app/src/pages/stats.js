const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');
const xhr = require('xhr');
const RegionSelect = require('../components/regionSelect')
const wca = require('../../../lib/wca');

const prettyfy = (x) => !x ? 0 : x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');


const CubeIcon = function (props) {
	return <span className={`cubing-icon event-${props.name}`} style={{fontSize: `${props.size || 1}em`}} title={wca.EventNames[props.name]} {...props}/>
}

const EventSelect = React.createClass({
	getInitialState () {
		return {
			selected: (() => {
				let events = {};
				wca.Events.forEach(event => {
					events[event] = true;
				});
				return events;
			})()
		};
	},

	toggleEvent (event) {
		this.state.selected[event] = !this.state.selected[event];
		this.forceUpdate();

		if (this.props.onChange) {
			this.props.onChange(wca.Events.filter(e => this.state.selected[e]));
		}
	},

	render () {
		let {selected} = this.state;

		return (
			<div>
				{wca.Events.map((event, index) => 
					<label key={index} style={{cursor: 'pointer', color: selected[event] ? 'black' : '#ccc'}} onClick={() => this.toggleEvent(event)}>
						<CubeIcon name={event} size='2'/>
					</label>
				)}
			</div>
		)
	}
});

module.exports = React.createClass({
	displayName: 'StatsPage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {};
	},

	getInitialState() {
		return {
			events: wca.Events,
			region: 'all',
			points: []
		};
	},

	componentDidMount() {
		this.updateStats();
	},

	componentWillReceiveProps(props) {
		this.props = props;
	},

	updateStats() {
		// if (this.request) {
		// 	this.request.onreadystatechange = null;
		// 	this.request.abort();
		// }

		console.log(this.state.events, this.state.events.join(','));
		let self = this;
		this.request = xhr.get(`${app.apiURL}/points/personEvent?events=${this.state.events.join(',')}`, function (err, res, body) {
			if (err) {
				console.error(err);
			} else {
				self.setState({
					points: JSON.parse(body)
				});
			}
		});
	},

	renderPoints () {
		let {events, points} = this.state;

		return (
			<table style={{width: '100%'}}>
				<thead>
					<tr>
						<th>Pos</th>
						<th>Name</th>
						<th style={{width: '5em'}}>Total</th>
						{events.map(i => 
							<th key={i}>{wca.EventNames[i]}</th>
						)}
					</tr>
				</thead>
				<tbody>
				{points ?
					points.map((personPoints,index) =>
						<tr key={index} style={{lineHeight: '1.75em'}}>
							<td>{index+1}</td>
							<td>{personPoints.name}</td>
							<td><b>{prettyfy(personPoints.totalPoints)}</b></td>
							{events.map(e => 
								<td key={e}>{prettyfy(personPoints[e])}</td>
							)}
						</tr>)
					: null}
				</tbody>
			</table>
		);
	},

	changeEvents (events) {
		console.log(30, events)
		this.state.events = events;

		this.updateStats();
	},

	changeRegion (region) {
		this.setState({region})
		this.updateStats();
	},

	render () {
		return (
			<div style={{margin: '1%'}}>
				<h2>Event Points</h2>
				<div className='panel panel-default'>
					<div className='panel-heading'>
					<div className='form-inline list'>
							<div className='form-group'>
							  <label htmlFor='events'>Events</label>
								<EventSelect onChange={this.changeEvents}/>
							</div>
						</div>
					</div>
				</div>
				{this.renderPoints()}
			</div>
		);
	}
});
							// <div className='form-group'>
							//   <label htmlFor='region'>Region</label>
							// 	<RegionSelect onChange={this.changeCountry} style={{display: 'block'}}/>
							// </div>
