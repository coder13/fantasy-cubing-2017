module.exports = function (bookshelf, db) {
	db.User = bookshelf.Model.extend({
		tableName: 'Users',
		hasTimestamps: ['createdAt', 'updatedAt'],

		team: function () {
			return this.hasOne(db.Team, 'owner');
		}
	});
};
