'use strict';
module.exports = function(sequelize, DataTypes) {
	let Team = sequelize.define('Team', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		league: DataTypes.STRING,
		owner: DataTypes.INTEGER,
		name: DataTypes.STRING,
		wins: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		losses: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		ties: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		ELO: {
			type: DataTypes.INTEGER,
			defaultValue: 1500
		}
	}, {
		classMethods: {
			associate: function(models) {
				Team.belongsTo(models.User, {foreignKey: 'owner'});

				Team.hasMany(models.TeamPerson, {foreignKey: 'teamId'});

				Team.hasMany(models.Matchup, {foreignKey: 'home'});
				Team.hasMany(models.Matchup, {foreignKey: 'away'});
			}
		},
		getOwner: function() {
			return Person.findById(this.owner);
		}
	});

	return Team;
};
