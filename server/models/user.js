const Sequelize = require('sequelize');
const sequelize = App.sequelize;

module.exports = sequelize.define('user', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true
	},
	wca_id: Sequelize.STRING,
	name: Sequelize.STRING,
	email: {
		type: Sequelize.STRING,
		validate: {
			isEmail: true
		}
	},
	avatar: Sequelize.STRING
}, {
	timestamps: false
});
