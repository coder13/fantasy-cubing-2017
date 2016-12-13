module.exports = {
	up: function(queryInterface, Sequelize) {
		return queryInterface.createTable('Users', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.INTEGER
			},
			wca_id: {
				type: Sequelize.STRING
			},
			name: {
				type: Sequelize.STRING
			},
			email: {
				validate: {
					isEmail: true
				},
				type: Sequelize.STRING
			},
			avatar: {
				type: Sequelize.STRING
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
		return queryInterface.dropTable('Users');
	}
};
