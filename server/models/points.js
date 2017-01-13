module.exports = function (bookshelf, db) {
	db.Points = bookshelf.Model.extend({
		tableName: 'Users',
		hasTimestamps: ['createdAt', 'updatedAt'],

		person: function () {
			return this.belongsTo(db.Person);
		}
	});
};
