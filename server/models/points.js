module.exports = function(sequelize, DataTypes) {
	let Points = sequelize.define('Points', {
		competitionId: DataTypes.STRING,
		personId: DataTypes.STRING,
		personName: DataTypes.STRING,
		eventId: DataTypes.STRING,
		roundId: DataTypes.CHAR,
		year: DataTypes.INTEGER,
		week: DataTypes.INTEGER,
		compPoints: DataTypes.INTEGER,
		skillPoints: DataTypes.INTEGER,
		totalPoints: DataTypes.INTEGER
	}, {
		timestamps: false,
		freezeTableName: true,
		tableName: 'Points',

		classMethods: {
			associate: function(models) {
				Points.belongsTo(models.Person, {foreignKey: 'personId'});
			}
		}
	});

	Points.removeAttribute('id');

	return Points;
};
