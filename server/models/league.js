module.exports = function (bookshelf, db) {
	db.League = bookshelf.Model.extend({
		tableName: 'Leagues',
		hasTimestamps: ['createdAt', 'updatedAt']
	});

	db.Leagues = bookshelf.Collection.extend({
		model: db.League
	});
};
