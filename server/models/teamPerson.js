'use strict';
module.exports = function(sequelize, DataTypes) {
	let TeamPerson = sequelize.define('TeamPerson', {
		owner: DataTypes.STRING,
		teamId: DataTypes.STRING,
		week: DataTypes.INTEGER,
		eventId: DataTypes.STRING,
		slot: DataTypes.INTEGER,
		personId: DataTypes.STRING
	}, {
		classMethods: {
			associate: function(models) {
				models.TeamPerson.belongsTo(models.Person, {foreignKey: 'personId'});
			}
		}
	});

	TeamPerson.removeAttribute('id');

	return TeamPerson;
};
