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
			points: {
				type: Sequelize.INTEGER,
				defaultValue: 0
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
		return queryInterface.dropTable('Teams');
	}
};
