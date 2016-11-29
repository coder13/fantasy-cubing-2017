'use strict';
module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.createTable('Teams', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.STRING
			},
			league: {
				type: Sequelize.STRING
			},
			owner: {
				type: Sequelize.INTEGER
			},
			name: {
				type: Sequelize.STRING
			},
			wins: {
				type: Sequelize.INTEGER,
				defaultValue: 0
			},
			losses: {
				type: Sequelize.INTEGER,
				defaultValue: 0
			},
			ties: {
				type: Sequelize.INTEGER,
				defaultValue: 0
			},
			ELO: {
				type: Sequelize.INTEGER,
				defaultValue: 1500
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		});
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.dropTable('Teams');
	}
};
