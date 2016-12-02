'use strict';

const Leagues = [{
	id: 0,
	name: 'Standard',
	period: 'weekly',
	region: 'World',
	'333': 3,
	'444': 2,
	'555': 2,
	'222': 2,
	'333bf': 2,
	'333oh': 2,
	'333fm': 1,
	'333ft': 1,
	'mega': 1,
	'pyram': 1,
	'sq1': 1,
	'skewb': 1,
	'clock': 1,
	'666': 1,
	'777': 1,
	'444bf': 1,
	'555bf': 1,
	'333mbf': 1,
	createdAt: new Date(),
	updatedAt: new Date()
}, {
	id: 1,
	name: 'Casual',
	period: 'monthly',
	region: 'World',
	'333': 3,
	'444': 2,
	'555': 2,
	'222': 2,
	'333bf': 2,
	'333oh': 2,
	'333fm': 1,
	'333ft': 1,
	'mega': 0,
	'sq1': 0,
	'pyram': 1,
	'skewb': 1,
	'clock': 0,
	'666': 0,
	'777': 0,
	'444bf': 0,
	'555bf': 0,
	'333mbf': 0,
	createdAt: new Date(),
	updatedAt: new Date()
}];

module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.createTable('Leagues', {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				primaryKey: true
			},
			name: Sequelize.STRING,
			period: {
				type: Sequelize.ENUM('weekly', 'monthly', 'annually')
			},
			region: Sequelize.STRING,
			'333': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'444': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'555': {
				type: Sequelize.INTEGER,
				defaultValue: 0
			},
			'222': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'333oh': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'333bf': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'333fm': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'333ft': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'mega': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'pyram': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'sq1': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'clock': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'skewb': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'666': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'777': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'444bf': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'555bf': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			'333mbf': {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		}).then(function () {
			return queryInterface.bulkInsert('Leagues', Leagues);
		});
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.dropTable('Leagues');
	}
};
