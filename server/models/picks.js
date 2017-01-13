module.exports = function (bookshelf, db) {
	db.Pick = bookshelf.Model.extend({
		tableName: 'Picks',
		hasTimestamps: ['createdAt', 'updatedAt'],

		owner: function () {
			return this.belongsTo(db.User);
		},

		team: function () {
			return this.belongsTo(db.Team);
		}
	});

	db.Picks = bookshelf.Collection.extend({
		model: db.Pick
	});
};
