const Model = require('ampersand-model');

module.exports = Model.extend({
	props: {
		id: 'number',
		name: 'string',
		spec: 'object'
	}
});
