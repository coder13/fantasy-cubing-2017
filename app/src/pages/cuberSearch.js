const app = require('ampersand-app');
const React = require('react');
const ampersandReactMixin = require('ampersand-react-mixin');
const {Segment, Input, Table} = require('semantic-ui-react');
const xhr = require('xhr');
const wca = require('../../../lib/wca');

module.exports = React.createClass({
	displayName: 'CuberSearchPage',
	mixins: [ampersandReactMixin],

	getDefaultProps () {
		return {};
	},

	getInitialState () {
		return {
			name: '',
			results: []
		};
	},

	search () {
		let {name} = this.state;

		if (name) {
			let self = this;
			fetch(`${app.apiURL}/search/people/${name}`)
			.then(data => data.json()).then(function (results) {
				self.setState({results});
			});
		} else {
			this.setState({results: []});
		}
	},

	searchChange (event, input) {
		this.state.name = input.value;
		this.search();
	},

	render () {
		let {name, results} = this.state;

		return (
			<div>
				<Segment.Group horizontal>
					<Segment compact>
						<Input icon='search' placeholder='Name...' value={name} onChange={this.searchChange}/>
					</Segment>
				</Segment.Group>
				<Table tableData={results} attached celled selectable renderBodyRow={(row, index) =>
					<Table.Row key={index}>
						<Table.Cell><a href={`/points/cubers/${row.personId}`}>{row.personName} ({row.personId})</a></Table.Cell>
					</Table.Row>
				}/>
			</div>
		);
	}
});
