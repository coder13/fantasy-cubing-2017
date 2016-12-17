module.exports = function(sequelize, DataTypes) {
	var Archive = sequelize.define('Archive', {
		teamId: DataTypes.STRING,
		week: DataTypes.INTEGER,
		points: DataTypes.INTEGER
	}, {
		freezeTableName: true,
		tableName: 'Archive',
		classMethods: {
			associate: function(models) {
			}
		}
	});

	Archive.removeAttribute('id');

	return Archive;
};
