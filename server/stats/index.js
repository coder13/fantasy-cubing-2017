const _ = require('lodash/fp');
const Boom = require('boom');
const moment = require('moment');
const wca = require('../../lib/wca');
const {unflatten} = require('../../lib/util');

const LIMIT = 25;

const time = (hour, min, sec) => ((hour * 60 + min) * 60 + sec) * 1000;

module.exports.register = function(server, options, next) {
	server.log('info', 'Setting up stats...');

	let {knex} = App.db;

	let queries = require('./queries')(knex);

	const sqlCache = {
		cache: 'redisCache',
		expiresIn: time(12,0,0),
		generateTimeout: 100,
		staleIn: time(2,0,0),
		staleTimeout: 100
	};

	let methodOptions = {
		cache: sqlCache,
		generateKey: key => JSON.stringify(key)
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
	}, methodOptions);

	server.method('getCuber', function (params, next) {
		return queries.person(params.personId).then(person => {
			if (person.length) {
				return queries.personPoints(params.personId).then(results =>
					next(null, {
						person: person[0],
						results: results.map(unflatten)
					})
				).catch(error => next(error));
			} else {
				return next(Boom.notFound('Could not find person'));
			}
		}).catch(error => next(error));
	});

	server.method('points.weeklyPoints', function (params, next) {
		let week = +params.week || (server.methods.getWeek() - 1);
		return limit(queries.weeklyPoints(week), params.limit)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, methodOptions);

	server.method('points.weeklyMVPs', function (params, next) {
		let week = +params.week || (moment().week() - 1);
		return queries.weeklyPoints(week).limit(5)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, methodOptions);

	server.method('points.quickRankings', function (params, next) {
		let week = +params.week || (moment().week() - 1);
		return queries.weeklyRankings(week).limit(5)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, methodOptions);

	server.method('points.rankings', function (params, next) {
		return limit(queries.rankings(), params.limit)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, methodOptions);

	server.method('points.seasonRankings', function (params, next) {
		return limit(queries.seasonRankings(params.season), params.limit)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, methodOptions);

	server.method('points.weeklyRankings', function (params, next) {
		let week = +params.week || (moment().week() - 1);

		return limit(queries.weeklyRankings(week), params.limit)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, methodOptions);

	server.method('points.weeklyCompProgress', function (params, next) {
		return queries.weeklyCompProgress(+params.week)
			.then(results => next(null, results[0]))
			.catch(error => next(error));
	}, methodOptions);

	server.method('points.mostPicked', function (params, next) {
		let week = +params.week || (server.methods.getWeek() - 1);

		if (week >= server.methods.getWeek()) {
			return next(Boom.unauthorized(`Not authorized to view picks for week ${week}`));
		}

		return limit(queries.mostPicked(week), params.limit)
			.then(results => next(null, results))
			.catch(error => next(error));
	}, methodOptions);

	next();
};

module.exports.register.attributes = {
	pkg: {
		name: 'stats',
		version: '0'
	}
};
