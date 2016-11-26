const fs = require('fs');
const path = require('path');
const sequelize = require('../sequelize');
const basename = path.basename(module.filename);
let db = {};

fs.readdirSync(__dirname)
	.filter((file) => file.indexOf('.') !== 0 && file !== basename)
	.filter((file) => file.slice(-3) === '.js')
	.forEach((file) => {
		let model = sequelize.import(path.join(__dirname, file));
		db[model.name] = model;
	});

Object.keys(db).forEach(function(modelName) {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.sequelize = require('../sequelize');

module.exports = db;
