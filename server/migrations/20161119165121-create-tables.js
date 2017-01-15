exports.up = function(knex, Promise) {
	return knex.schema.createTable('Teams', function (teams) {
		teams.string('id').primary();
		teams.integer('owner').notNullable();
		teams.string('name').notNullable();
		teams.integer('points');
		teams.timestamp('createdAt').defaultTo(knex.fn.now());
		teams.timestamp('updatedAt').defaultTo(knex.fn.now());
	}).createTable('Users', function (users) {
		users.integer('id').primary();
		users.string('wca_id').nullable().unique();
		users.string('name').notNullable().collate('utf8_unicode_ci');
		users.string('email').notNullable().unique();
		users.string('teamId');
		users.timestamp('createdAt').defaultTo(knex.fn.now());
		users.timestamp('updatedAt').defaultTo(knex.fn.now());
	}).createTable('Picks', function (picks) {
		picks.string('league').notNullable();
		picks.integer('owner').notNullable();
		picks.string('teamId').notNullable();
		picks.integer('week').notNullable();
		picks.integer('slot').notNullable();
		picks.string('personId').notNullable();
		picks.string('eventId').notNullable();
		picks.timestamp('createdAt').defaultTo(knex.fn.now());
		picks.timestamp('updatedAt').defaultTo(knex.fn.now());
	}).createTable('Archive', function (archive) {
		archive.string('teamId').notNullable();
		archive.integer('week').notNullable();
		archive.decimal('points').notNullable();
		archive.timestamp('createdAt').defaultTo(knex.fn.now());
		archive.timestamp('updatedAt').defaultTo(knex.fn.now());
	});
};

exports.down = function(knex, Promise) {
	return knex.schema
		.dropTable('Archive')
		.dropTable('Picks')
		.dropTable('Users')
		.dropTable('Teams');
};
