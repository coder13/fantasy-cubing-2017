'use strict';
module.exports = function(sequelize, DataTypes) {
	let League = sequelize.define('League', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: DataTypes.STRING,
		period: {
			type: DataTypes.ENUM('weekly', 'monthly', 'annually')
		},
		region: DataTypes.STRING,
		'222': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'333': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'444': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'555': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'666': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'777': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'333oh': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'333bf': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'333fm': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'333ft': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'sq1': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'pyram': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'skewb': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'mega': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'clock': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'444bf': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'555bf': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		'333mbf': {
			type: DataTypes.INTEGER,
			defaultValue: 0
		}
	}, {
		classMethods: {
			associate: function(models) {
			}
		}
	});

	return League;
};
