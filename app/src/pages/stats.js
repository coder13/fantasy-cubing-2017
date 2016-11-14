const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');
const xhr = require('xhr');

const prettyfy = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

module.exports = React.createClass({
	displayName: 'HomePage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {};
	},

	getInitialState() {
		return {
			tab: 'career',
			points: []
		};
	},

	componentDidMount() {
		this.retrievePoints();
	},

	componentWillReceiveProps(props) {
		this.props = props;
		this.retrievePoints();
	},

	retrievePoints() {
		console.log(33, this.props.past);
		this.setState({points: []});
		let that = this;
		xhr.get(`${app.apiURL}/points${this.props.past?`?past=${this.props.past}`:''}`, function (err, data, body) {
			if (data.statusCode === 200) {
				that.setState({
					points: JSON.parse(body)
				});
			}
		});
	},

	renderPoints() {
		return (
			<table style={{width: '100%'}}>
				<thead>
					<tr>
						<th>Pos</th>
						<th>Name</th>
						<th>333</th>
						<th>444</th>
						<th>555</th>
						<th>222</th>
						<th>333bf</th>
						<th>333oh</th>
						<th>333fm</th>
						<th>333ft</th>
						<th>minx</th>
						<th>pyram</th>
						<th>sq1</th>
						<th>clock</th>
						<th>skewb</th>
						<th>666</th>
						<th>777</th>
						<th>444bf</th>
						<th>555bf</th>
						<th>333mbf</th>
						<th>Total Points</th>
						<th>Comps</th>
						<th>Points/Comp</th>
					</tr>
				</thead>
				<tbody>
				{this.state.points ?
					this.state.points.map((i,j) =>
						<tr key={i.personId} style={{lineHeight: '1.75em'}}>
							<td>{j+1}</td>
							<td>{i.personName}</td>
							<td>{prettyfy(i['333'])}</td>
							<td>{prettyfy(i['444'])}</td>
							<td>{prettyfy(i['555'])}</td>
							<td>{prettyfy(i['222'])}</td>
							<td>{prettyfy(i['333bf'])}</td>
							<td>{prettyfy(i['333oh'])}</td>
							<td>{prettyfy(i['333fm'])}</td>
							<td>{prettyfy(i['333ft'])}</td>
							<td>{prettyfy(i['minx'])}</td>
							<td>{prettyfy(i['pyram'])}</td>
							<td>{prettyfy(i['sq1'])}</td>
							<td>{prettyfy(i['clock'])}</td>
							<td>{prettyfy(i['skewb'])}</td>
							<td>{prettyfy(i['666'])}</td>
							<td>{prettyfy(i['777'])}</td>
							<td>{prettyfy(i['444bf'])}</td>
							<td>{prettyfy(i['555bf'])}</td>
							<td>{prettyfy(i['333mbf'])}</td>
							<td><b>{prettyfy(i.totalPoints)}</b></td>
							<td>{i.comps}</td>
							<td>{Math.round(i.pointsCompRatio*100)/100}</td>
						</tr>)
					: null}
				</tbody>
			</table>
		);
	},

	render () {
		return (
			<div style={{margin: '1%'}}>
				<h4>Total Points</h4>
				<ul className='nav nav-tabs' style={{marginBottom: '5px'}}>
					<li role='presentation' className={!this.props.past ? 'active' : ''}><a href='/stats'>Career</a></li>
					<li role='presentation' className={this.props.past === 'year' ? 'active' : ''}><a href='/stats?past=year'>Past Year</a></li>
					<li role='presentation' className={this.props.past === '6months' ? 'active' : ''}><a href='/stats?past=6months'>Past 6 Months</a></li>
					<li role='presentation' className={this.props.past === '3months' ? 'active' : ''}><a href='/stats?past=3months'>Past 3 Months</a></li>
				</ul>
				{this.renderPoints()}
			</div>
		);
	}
});
