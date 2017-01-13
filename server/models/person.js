module.exports = function (bookshelf, db) {
	db.Person = bookshelf.Model.extend({
		tableName: 'Persons',
		hasTimestamps: false,

		points: function (week) {
			return this.hasMany(db.Points, 'personId');
		}
	});
};
