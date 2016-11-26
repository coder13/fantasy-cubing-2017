const Collection = require('ampersand-rest-collection');
const Team = require('./team');

module.exports = Collection.extend({
	model: Team,

	url () {
		return `${app.apiURL}/teams`;
	}
});
