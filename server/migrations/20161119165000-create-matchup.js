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
			week: {
				type: Sequelize.INTEGER
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
		return queryInterface.dropTable('Matchups');
	}
};
