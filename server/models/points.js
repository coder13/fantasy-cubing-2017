'use strict';
module.exports = function(sequelize, DataTypes) {
	let Points = sequelize.define('Points', {
		competitionId: DataTypes.STRING,
		personId: DataTypes.STRING,
		personName: DataTypes.STRING,
		eventId: DataTypes.STRING,
		roundId: DataTypes.CHAR,
		date: DataTypes.DATE,
		worldPoints: DataTypes.INTEGER,
		compPoints: DataTypes.INTEGER
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
