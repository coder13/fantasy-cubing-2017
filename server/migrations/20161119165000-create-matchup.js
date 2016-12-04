'use strict';
module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.createTable('Matchups', {
			home: {
				type: Sequelize.STRING
			},
			away: {
				type: Sequelize.STRING
			},
			league: {
				type: Sequelize.STRING
			},
			winner: {
				type: Sequelize.STRING
			},
			week: {
				type: Sequelize.INTEGER
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW')
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW')
			}
		});
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.dropTable('Matchups');
	}
};
