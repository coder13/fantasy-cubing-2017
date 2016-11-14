const Sequelize = require('sequelize');
const sequelize = App.sequelize;

const TeamPeople = module.exports = sequelize.define('teamPeople', {
	owner: Sequelize.STRING,
	teamId: Sequelize.STRING,
	eventId: Sequelize.STRING,
	slot: Sequelize.INTEGER,
	personId: Sequelize.STRING
}, {
	timestamps: false
});

TeamPeople.removeAttribute('id');
