module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.createTable('Archive', {
			teamId: {
				allowNull: false,
				type: Sequelize.STRING
			},
			week: {
				allowNull: false,
				type: Sequelize.INTEGER
			},
			points: {
				allowNull: false,
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
		return queryInterface.dropTable('Archive');
	}
};
