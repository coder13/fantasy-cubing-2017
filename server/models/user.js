module.exports = function (sequelize, DataTypes) {
	let User = sequelize.define('User', {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		wca_id: DataTypes.STRING,
		name: DataTypes.STRING,
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true
			}
		},
		avatar: DataTypes.STRING,
	}, {
		classMethods: {
			associate: function(models) {
				User.hasMany(models.Team, {foreignKey: 'owner'});
			}
		}
	});

	return User;
};
