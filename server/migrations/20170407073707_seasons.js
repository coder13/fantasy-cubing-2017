
exports.up = function(knex, Promise) {
  return knex.schema.table('Archive', function (table) {
  	table.integer('season');
  }).then(() =>
  	knex('Archive').where('week', '<', 14).update({
  		season: 1
  	})
  ).then(() =>
  	knex('Archive').where('week', '>=', 14).update({
  		season: 2
  	})
  );
};

exports.down = function(knex, Promise) {
    return knex.schema.table('Archive', function (table) {
  		table.dropColumn('season');
  	});
};
