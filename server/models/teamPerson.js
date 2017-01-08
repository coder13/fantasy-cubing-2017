module.exports = function(sequelize, DataTypes) {
	let TeamPerson = sequelize.define('TeamPerson', {
		owner: DataTypes.INTEGER,
		teamId: DataTypes.STRING,
		week: DataTypes.INTEGER,
		slot: DataTypes.INTEGER,
		eventId: DataTypes.STRING,
		personId: DataTypes.STRING
	}, {
		classMethods: {
			associate: function(models) {
				models.TeamPerson.belongsTo(models.Person, {foreignKey: 'personId'});
			}
		}
	});

	TeamPerson.removeAttribute('id');

	return TeamPerson;
};
