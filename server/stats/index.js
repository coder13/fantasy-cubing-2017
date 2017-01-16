const _ = require('lodash/fp');
const Boom = require('boom');
const moment = require('moment');
const wca = require('../../lib/wca');

const LIMIT = 25;

const time = (hour, min, sec) => ((hour * 60 + min) * 60 + sec) * 1000;

module.exports.register = function(server, options, next) {
	server.log('info', 'Setting up stats...');

	let {knex} = App.db;

	let queries = require('./queries')(knex);

	const sqlCache = {
		cache: 'redisCache',
		expiresIn: time(48,0,0),
		generateTimeout: 100000,
		staleIn: time(16,0,0),
		staleTimeout: 100
	};

	let methodOptions = {
		cache: sqlCache,
		generateKey: function (array) {
			return array.join(',');
		}
	};

	let limit = (query, limit) => limit ? query.limit(limit) : query;

	server.method('getRecords', function (params, next) {
		if (params.event) {
			return queries.recordsByEvent(params.event, params.region, params.date)
				.then(results => next(null, results[0]))
				.catch(error => next(error));
		} else {
			return queries.records(params.region, params.date)
				.then(results => next(null, _.fromPairs(results.map(e => [e.eventId, {average: e.average, single: e.single}]))))
				.catch(error => next(error));
		}
	}, options);

	server.method('points.weeklyPoints', function (params, next) {
		let week = +params.week || (server.methods.getWeek() - 1);
		return limit(queries.weeklyPoints(week), params.limit)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, options);

	server.method('points.weeklyMVPs', function (params, next) {
		let week = +params.week || (moment().week() - 1);
		return queries.weeklyPoints(week).limit(5)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, options);

	server.method('points.quickRankings', function (params, next) {
		let week = +params.week || (moment().week() - 1);
		return queries.weeklyRankings(week).limit(5)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, options);

	server.method('points.rankings', function (params, next) {
		return limit(queries.rankings(), params.limit)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, options);

	server.method('points.weeklyRankings', function (params, next) {
		let week = +params.week || (moment().week() - 1);

		return limit(queries.weeklyRankings(week), params.limit)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, options);

	server.method('points.weeklyCompProgress', function (params, next) {
		return queries.weeklyCompProgress(+params.week)
			.then(results => next(null, results[0]))
			.catch(error => next(error));
	}, options);

	server.method('points.mostPicked', function (params, next) {
		let week = +params.week || (server.methods.getWeek() - 1);

		if (week >= server.methods.getWeek()) {
			return next(Boom.unauthorized(`Not authorized to view picks for week ${week}`));
		}

		return limit(queries.mostPicked(week), 100)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, options);

	next();
};

module.exports.register.attributes = {
	pkg: {
		name: 'stats',
		version: '0'
	}
};
