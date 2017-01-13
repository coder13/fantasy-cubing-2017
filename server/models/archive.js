module.exports = function (bookshelf, db) {
	db.Archive = bookshelf.Model.extend({
		tableName: 'Archive',
		hasTimestamps: false
	}, {
		week (week) {
			return this.forge({week}).fetch();
		}
	});
};
