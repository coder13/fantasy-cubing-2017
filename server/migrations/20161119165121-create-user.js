exports.up = function(knex, Promise) {
	return knex.schema.createTable('Users', function (table) {
		table.integer('id').primary();
		table.string('wca_id').nullable().unique();
		table.string('name').notNullable().collate('utf8_unicode_ci');
		table.string('email').notNullable().unique();
		table.string('teamId');
		table.timestamp('createdAt').defaultTo(knex.fn.now());
		table.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('Users');
};
