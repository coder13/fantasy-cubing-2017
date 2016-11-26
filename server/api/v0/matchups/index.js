'use strict';

const _ = require('lodash/fp');
const Boom = require('boom');

const {Team, Matchup} = App.db;

const base = '/api/v0/matchups';

module.exports = [{
	method: 'GET',
	path: `${base}/{league}/{week}`,
	config: {
		handler: function (request, reply) {
			let league = request.params.league;
			let week = parseInt(request.params.week);

			Matchup.findAll({
				attributes: ['league', 'week'],
				include: [{
					model: Team,
					as: 'homeTeam',
					attributes: ['name', 'owner']
				}, {
					model: Team,
					as: 'awayTeam',
					attributes: ['name', 'owner']
				}],
				where: {
					league: league,
					week: week
				}
			}).then(function (matchups) {
				reply(matchups);
			}).catch(function (error) {
				console.log(error)
			});
		}
	}
}];
