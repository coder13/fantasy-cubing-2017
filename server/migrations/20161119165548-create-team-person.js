'use strict';
module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.createTable('TeamPeople', {
			owner: {
				type: Sequelize.STRING
			},
			teamId: {
				type: Sequelize.STRING
			},
			week: {
				type: Sequelize.INTEGER
			},
			eventId: {
				type: Sequelize.STRING
			},
			slot: {
				type: Sequelize.INTEGER
			},
			personId: {
				type: Sequelize.STRING
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
		return queryInterface.dropTable('TeamPeople');
	}
};
