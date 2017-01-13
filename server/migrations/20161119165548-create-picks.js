exports.up = function(knex, Promise) {
	return knex.schema.createTable('Picks', function (table) {
		table.string('league').notNullable().references('id').inTable('Leagues');
		table.integer('owner').notNullable().references('id').inTable('Users');
		table.string('teamId').notNullable().references('id').inTable('Teams');
		table.integer('week').notNullable();
		table.integer('slot').notNullable();
		table.string('personId').notNullable();
		table.string('eventId').notNullable();
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('Picks');
};
