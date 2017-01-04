const moment = require('moment');
const {Menu, Item} = require('semantic-ui-react');

const format = date => date.format('MMMM Do');

module.exports = function (props) {
	let start = moment().week(props.week).day(4);
	let end = moment().week(props.week).day(4).add(6, 'days');

	return (
		<Menu pagination>
			<Menu.Item icon='left chevron' onClick={props.last}/>
			<Menu.Item disabled name={`Week: ${props.week}`}/>
			<Menu.Item icon='right chevron' onClick={props.next}/>
			<Item as={Menu.Item} disabled>{format(start)} - {format(end)}</Item>
		</Menu>
	);
};
