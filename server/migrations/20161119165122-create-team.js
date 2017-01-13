exports.up = function(knex, Promise) {
	return knex.schema.createTable('Teams', function (table) {
		table.string('id').primary();
		table.integer('owner').notNullable().references('id').inTable('Users');
		table.string('name').notNullable();
		table.integer('points');
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('Teams');
};
