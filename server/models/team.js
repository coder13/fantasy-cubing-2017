const Sequelize = require('sequelize');
const sequelize = App.sequelize;

module.exports = sequelize.define('team', {
	id: {
		type: Sequelize.STRING,
		primaryKey: true
	},
	owner: Sequelize.INTEGER,
	name: Sequelize.STRING
}, {
	timestamps: false
});
