'use strict';
module.exports = function(sequelize, DataTypes) {
	let Matchup = sequelize.define('Matchup', {
		home: DataTypes.STRING,
		away: DataTypes.STRING,
		league: DataTypes.STRING,
		week: DataTypes.INTEGER
	}, {
		classMethods: {
			associate: function(models) {
				Matchup.belongsTo(models.Team, {
					as: 'homeTeam',
					foreignKey: 'home'
				});

				Matchup.belongsTo(models.Team, {
					as: 'awayTeam',
					foreignKey: 'away'
				});
			}
		}
	});

	Matchup.removeAttribute('id');

	return Matchup;
};
