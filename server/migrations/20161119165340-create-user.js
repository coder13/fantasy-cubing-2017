'use strict';
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
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		});
	},
	down: function(queryInterface, Sequelize) {
		return queryInterface.dropTable('Users');
	}
};
