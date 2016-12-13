const {Menu} = require('semantic-ui-react');

module.exports = function (props) {
	return (
		<Menu pagination>
			<Menu.Item icon='left chevron' onClick={props.last}/>
			<Menu.Item disabled name={`Week: ${props.week}`}/>
			<Menu.Item icon='right chevron' onClick={props.next}/>
		</Menu>
	);
};
