'use strict';

const _ = require('lodash/fp');
const Boom = require('boom');
const shortId = require('shortid');
const moment = require('moment');

const {User, Team, Person, TeamPerson} = App.db;

const time = (hour, min, sec) => ((hour * 60 + min) * 60 + sec) * 1000;

const getWeek = () => moment().week();

const teamQuery = (teamId, week) => `
	SELECT mine.eventId, mine.slot, mine.personId, Persons.name, Persons.countryId, p.points FROM (SELECT teamId, eventId, slot, MAX(week) week FROM TeamPeople WHERE teamId='${teamId}' AND week <= ${week} GROUP BY teamId,eventId,slot) tp
	LEFT JOIN TeamPeople mine on tp.teamId=mine.teamId AND tp.eventId=mine.eventId AND tp.slot=mine.slot AND tp.week=mine.week
	LEFT JOIN Persons ON Persons.id = mine.personId
	LEFT JOIN (SELECT eventId,personId,week,personCountryId,personName,
	SUM(compPoints)+SUM(wrAveragePoints)+SUM(wrSinglePoints)+SUM(crAveragePoints)+SUM(crSinglePoints)+SUM(nrAveragePoints)+SUM(nrSinglePoints) points
		FROM Points WHERE year=2016 AND week=${week} GROUP BY eventId,personId,week,personCountryId,personName) p ON mine.personId=p.personId AND mine.eventId=p.eventId;`;

module.exports = function (server, base) {
	server.method('teams.get', function (id, week, next) {
		Team.findById(id).then(function (team) {
			if (!team) {
				return reply(Boom.notFound('Team not found', 400));
			}

			return App.db.sequelize.query(teamQuery(id, week)).then(people =>
				next(null, {
					owner: team.owner,
					id: team.id,
					name: team.name,
					wins: team.wins,
					losses: team.losses,
					ties: team.ties,
					ELO: team.ELO,
					cubers: _.chain(people[0]).filter(p => !!p.personId).map((p,index) => ({
						eventId: p.eventId,
						slot: p.slot,
						personId: p.personId,
						name: p.name,
						countryId: p.countryId,
						points: p.points || 0
					})).keyBy(p => `${p.eventId}-${p.slot}`).value()
				})
			).catch(error => next(error));
		}).catch(error => next(error));
	}, {
		cache: {
			cache: 'redisCache',
			segment: 'teams',
			generateTimeout: 20000,
			expiresIn: time(1,0,0),
			staleIn: time(0,1,0),
			staleTimeout: 2000
		}
	});

	server.route([{
		method: 'GET',
		path: `${base}/teams`,
		/* Query Params
		 * week: defaults to current
		 * league: defaults to Standard
		 */
		config: {
			handler: function (request, reply) {
				let {week, league} = request.query;

				Team.findAll({
					where: {
						league: league || 'Standard'
					}
				}).then(function (teams) {
					reply(teams);
				});
			}
		}
	}, {
		method: 'GET',
		path: `${base}/teams/{id}`,
		config: {
			handler: function (request, reply) {
				const {week} = request.query;

				server.methods.teams.get(request.params.id, week || moment().week(), function (err, team) {
					if (err) {
						return reply(Boom.wrap(err, 500));
					}

					return reply(team);
				});
			}
		}
	}, { // create
		method: 'POST',
		path: `${base}/teams/`,
		config: {
			auth: 'session',
			handler: function (request, reply) {
				let profile = request.auth.credentials.profile;
				let {league, owner, name} = request.payload;

				if (profile.id !== +owner) {
					return reply(Boom.unauthorized('Not allowed to create team'));
				}

				Team.find({
					where: {owner}
				}).then(function (team) {
					if (team) {
						return reply(Boom.conflict('Already have a team'));
					}

					return Team.create({
						id: shortId.generate(),
						owner: owner,
						name: name,
						league: 'Standard' // TODO: update for support for multiple leagues
					}).then(function (team) {
						request.server.log('info', `Created team '${request.payload.name}' for user ${profile.id} ${profile.name} (${profile.wca_id})`);
						return reply(team).code(200);
					});
				}).catch(error => reply(Boom.wrap(error, 500)));
			}
		}
	}, { // update
		method: 'PUT',
		path: `${base}/teams/{id}`,
		config: {
			auth: 'session',
			handler: function (request, reply) {
				let profile = request.auth.credentials.profile;
				let {id, owner, name} = request.payload;

				if (profile.id !== +owner) {
					return reply(Boom.unauthorized('Not allowed to create team'));
				}

				let where = {
					owner: owner,
					id: id
				};

				Team.findById(request.params.id).then(function (team) {
					if (!team) {
						return reply(Boom.notFound('Team not found'));
					}

					if (team.owner !== profile.id) {
						return reply(Boom.unauthorized('Not allowed to edit team'));
					}

					return Team.update(_.extend(where, {name: name}), {where}).then((team) => reply(team).code(201));
				});
			}
		}
	}, { // Set Cuber
		method: 'PUT',
		path: `${base}/teams/{id}/{eventId}/{slot}`,
		config: {
			auth: 'session',
			handler: function (request, reply) {
				let weekend = request.server.methods.getWeekend();
				if (moment().isSameOrAfter(weekend) && !process.env.NODE_ENV === 'dev') {
					return reply(Boom.create(400, 'Team is locked from editing'));
				}

				let profile = request.auth.credentials.profile;
				let payload = JSON.parse(request.payload);
				let {id, eventId, slot} = request.params;

				let where = {
					owner: profile.id,
					id: id
				};

				Team.findById(id).then(function (team) {
					if (!team) {
						return reply(Boom.notFound('Team not found'));
					}

					if (team.owner !== profile.id) {
						return reply(Boom.unauthorized('Not allowed to edit team'));
					}

					payload.personId = payload.personId || '';

					let TeamPersonWhere = {
						teamId: id,
						owner: profile.id,
						eventId: request.params.eventId,
						slot: request.params.slot,
						week: getWeek()
					};

					return TeamPerson.find({
						where: {
							teamId: id,
							owner: profile.id,
							personId: payload.personId,
							week: getWeek()
						}
					}).then(function (alreadyUsedPerson) {
						if (alreadyUsedPerson && alreadyUsedPerson.personId !== '') {
							return reply(Boom.badRequest('Person already exists in Team.'));
						}

						return TeamPerson.find({where: TeamPersonWhere}).then(function (teamPerson) {
							let newTeamPerson = _.extend(TeamPersonWhere, {
								personId: payload.personId
							});

							let createOrUpdate = teamPerson ? TeamPerson.update(newTeamPerson, {where: TeamPersonWhere}) : TeamPerson.create(newTeamPerson);
							createOrUpdate.then(() => {
								request.server.log('info', `Set team member '${payload.personId}' in ${request.params.eventId}-${request.params.slot} for team '${payload.teamId}'`);
								if (payload.personId) {
									Person.findById(payload.personId).then(person => reply(JSON.stringify(person)).code(201));
								} else {
									reply(null);
								}
							});
						});
					});
				});
			}
		}
	}]);
}
