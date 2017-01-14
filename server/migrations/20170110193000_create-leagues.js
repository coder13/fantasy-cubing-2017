/*
	id 		- auto incrementing integer
	name		- name of league
	period - frequency picks reset
	resets - how often the league resets. Kicks people out and prepares for new "season"
	region - person country restriction
	spec   - json of the event specs.
	default spec: {
		type: 'classes',
		classes: [{
			class: 1,
			name: '3x3'
			events: ['333']
		}, {
			class: 2,
			name: 'Main Events'
			events: ['222', '444', '555', 'skewb', 'pyram', '333oh', '333bf']
		}, {
			class: 3,
			name: 'Side Events'
			events: ['333fm', '333ft', 'minx', 'sq1', 'clock', '666', '777', '444bf', '555bf', '333mbf']
		}
	}
*/

exports.up = function(knex, Promise) {
	return knex.schema.createTable('Leagues', function (table) {
		table.increments('id').primary();
		table.string('name').notNullable();
		table.boolean('competitive').notNullable();
		table.enu('period', ['week', 'month', 'season', 'year']).notNullable();
		table.enu('resets', ['never', 'week', 'month', 'season', 'year']).notNullable();
		table.string('region');
		table.dateTime('start');
		table.json('spec');
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('Leagues');
};
