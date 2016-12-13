module.exports = function(sequelize, DataTypes) {
	let Team = sequelize.define('Team', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		league: DataTypes.STRING,
		owner: DataTypes.INTEGER,
		name: DataTypes.STRING,
		points: DataTypes.INTEGER
	}, {
		classMethods: {
			associate: function(models) {
				Team.belongsTo(models.User, {foreignKey: 'owner'});

				Team.hasMany(models.TeamPerson);
			},
			getOwner: function() {
				return Person.findById(this.owner);
			}
		}
	});

	return Team;
};
