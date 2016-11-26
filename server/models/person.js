'use strict';
module.exports = function(sequelize, DataTypes) {
	let Person = sequelize.define('Person', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		name: DataTypes.STRING,
		countryId: DataTypes.STRING
	}, {
		timestamps: false,
		freezeTableName: true,
		tableName: 'Persons',

		classMethods: {
			associate: function(models) {
				Person.hasMany(models.TeamPerson, {foreignKey: 'personId'});
			}
		}
	});

	return Person;
};
