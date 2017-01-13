exports.up = function(knex, Promise) {
	return knex.schema.createTable('Archive', function (table) {
		table.string('teamId').notNullable().references('id').inTable('Teams');
		table.integer('week').notNullable();
		table.decimal('points', 2).notNullable();
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('Archive');
};
