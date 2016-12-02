'use strict';
const moment = require('moment');
const wca = require('../../lib/wca');
const queries = require('./queries');

const LIMIT = 25;

const time = (hour, min, sec) => ((hour * 60 + min) * 60 + sec) * 1000;

const Cache = {
	expiresIn: time(48,0,0),
	generateTimeout: 100000,
	staleIn: time(16,0,0),
	staleTimeout: 100
};

const cacheQueries = function (server) {
	server.methods.getAllPersonEventPoints(wca.Events, (err, results) => {
		if (err) {
			server.log('err', err);
		} else {
			console.log('cached getAllPersonEventPoints');
		}
	});

	server.methods.getAllCountryEventPoints(wca.Events, (err, results) => {
		if (err) {
			server.log('err', err);
		} else {
			console.log('cached getAllCountryEventPoints');
		}
	});

	server.methods.getAllCompetitionEventPoints(wca.Events, (err, results) => {
		if (err) {
			server.log('err', err);
		} else {
			console.log('cached getAllCompetitionEventPoints');
		}
	});
};

module.exports.register = function(server, options, next) {
	server.log('info', 'Setting up stats...');

	let sequelize = App.db.sequelize;

	server.method('getAllPersonEventPoints', function (include, next) {
		if (!include) {
			include = wca.Events;
		}

		return sequelize.query(queries.personEvent(include, LIMIT)).then(function (results) {
			next(null, results);
		}).catch(error => next(error));
	}, {
		cache: Cache,
		generateKey: function (array) {
			return array.join(',');
		}
	});

	server.method('getAllCountryEventPoints', function (include, next) {
		if (!include) {
			include = wca.Events;
		}

		return sequelize.query(queries.countryEvent(include, LIMIT)).then(function (results) {
			next(null, results);
		}).catch(error => next(error));
	});

	server.method('getAllCompetitionEventPoints', function (include, next) {
		if (!include) {
			include = wca.Events;
		}

		return sequelize.query(queries.competitionEvent(include, LIMIT)).then(function (results) {
			next(null, results);
		}).catch(error => next(error));
	});

	if (process.env.NODE_ENV.slice(0,4) === 'prod') {
		cacheQueries(server);
	}

	next();
};

module.exports.register.attributes = {
	pkg: {
		name: 'stats',
		version: '0'
	}
};
