const Sequelize = require('sequelize');
const ENV = process.env.NODE_ENV || 'development';
const config = require('config').db;

if (!(config.database && config.username && config.password)) {
	throw new Error('Database config variables not set!');
}

module.exports = new Sequelize(config.database, config.username, config.password, {
	logging: global.App ? (str) => App.server.log('sql', str) : false
});
