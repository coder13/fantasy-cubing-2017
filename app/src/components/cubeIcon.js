const {EventNames} = require('../../../lib/wca');

module.exports = function (props) {
	return <span className={`cubing-icon event-${props.name}`} style={{fontSize: `${props.size || 1}em`}} title={EventNames[props.name]} {...props}/>
}
