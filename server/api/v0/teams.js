const _ = require('lodash/fp');
const Boom = require('boom');
const shortId = require('shortid');
const moment = require('moment');

const {sequelize, User, Team, Person, TeamPerson} = App.db;

const time = (hour, min, sec) => ((hour * 60 + min) * 60 + sec) * 1000;

const getWeek = () => moment().week();

let classes = [{
	slots: 2,
	events: ['333']
}, {
	slots: 4,
	events: ['444', '555', '222', 'skewb', 'pyram', '333oh', '333bf']
}, {
	slots: 4,
	events: ['333fm', '333ft', 'minx', 'sq1', 'clock', '666', '777', '444bf', '555bf', '333mbf']
}];

/* Just grab the most recent team thus every new week, your team will be blank. No more cascading. */
const teamQuery = `
SELECT tp.eventId, tp.slot, tp.personId, Persons.name, Persons.countryId
FROM TeamPeople tp
JOIN Persons ON Persons.id = tp.personId
WHERE teamId=:teamId AND week=:week
`;

// const teamQuery = `
// SELECT mine.eventId, mine.slot, mine.personId, Persons.name, Persons.countryId FROM (SELECT teamId, slot, MAX(week) week FROM TeamPeople WHERE teamId=:teamId AND week <= :week GROUP BY teamId,slot) tp
// LEFT JOIN TeamPeople mine ON tp.teamId = mine.teamId AND tp.slot = mine.slot AND tp.week = mine.week
// INNER JOIN Persons ON Persons.id = mine.personId`;

// LEFT JOIN (SELECT eventId,personId,week,personCountryId,personName,
// SUM(compPoints)+SUM(wrAveragePoints)+SUM(wrSinglePoints)+SUM(crAveragePoints)+SUM(crSinglePoints)+SUM(nrAveragePoints)+SUM(nrSinglePoints) points
// 	FROM Points WHERE year=2016 AND week=:week GROUP BY eventId,personId,week,personCountryId,personName) p ON mine.personId=p.personId AND mine.eventId=p.eventId;`;

/*
 *	key: {
 *		id: (teamId),
 *		week: (number),
 *		points: (true/false)
 *	}
*/
const getTeam = function (key, next) {
	return Team.findById(key.id).then(function (team) {
		if (!team) {
			return next(Boom.notFound('Team not found'));
		}

		return sequelize.query(teamQuery, {
			replacements: {
				teamId: key.id,
				week: key.week
			},
			type: sequelize.QueryTypes.SELECT
		}).then(people =>
			next(null, {
				owner: team.owner,
				id: team.id,
				name: team.name,
				points: team.points,
				cubers: people
			})
		).catch(error => next(error));
	}).catch(error => next(error));
};

module.exports = function (server, base) {
	const teamCache = server.cache({
		cache: 'redisCache',
		segment: 'teams',
		generateTimeout: false,
		expiresIn: time(2,0,0),
		staleIn: time(0,1,0),
		staleTimeout: 2000,
		generateFunc: function (key, next) {
			return getTeam(key, next);
		}
	});

	server.method('teams.get', function (key, next) {
		teamCache.get(key, next);
	});

	server.method('teams.set', function (key, team, next) {
		teamCache.set(key, team, 0, next);
	});

	server.route([{
		method: 'GET',
		path: `${base}/teams`,
		/* Query Params
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
				const week = +request.query.week;
				console.log(request.query)

				getTeam({//server.methods.teams.get({
					id: request.params.id,
					week: week
				}, function (err, team) {
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
						server.log('info', `Created team '${request.payload.name}' for user ${profile.id} ${profile.name} (${profile.wca_id})`);
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
		path: `${base}/teams/{id}/{slot}`,
		config: {
			auth: 'session',
			handler: function (request, reply) {
				let weekend = server.methods.getWeekend();
				if (moment().isSameOrAfter(weekend) && !process.env.NODE_ENV === 'dev') {
					return reply(Boom.create(400, 'Team is locked from editing'));
				}

				let profile = request.auth.credentials.profile;
				let payload = JSON.parse(request.payload);
				let {id, slot} = request.params;

				if (payload.eventId) {
					let c = payload.slot < 2 ? 0 : payload.slot < 6 ? 1 : 2;
					if (classes[c].events.indexOf(payload.eventId) === -1) {
						return reply(Boom.create(400, 'Invalid event selection for class'));
					}
				}

				let where = {
					owner: profile.id,
					id: id
				};

				return Team.findById(id).then(function (team) {
					if (!team) {
						return reply(Boom.notFound('Team not found'));
					}

					if (team.owner !== profile.id) {
						return reply(Boom.unauthorized('Not allowed to edit team'));
					}

					payload.personId = payload.personId || '';
					payload.eventId = payload.eventId || '';

					let TeamPersonWhere = {
						teamId: id,
						owner: profile.id,
						slot: slot,
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
						if (alreadyUsedPerson && (alreadyUsedPerson.personId !== '' && alreadyUsedPerson.personId !== payload.personId)) {
							return reply(Boom.badRequest('Person already exists in Team.'));
						}

						return TeamPerson.find({where: TeamPersonWhere}).then(function (teamPerson) {
							let newTeamPerson = _.extend(TeamPersonWhere, {
								personId: payload.personId,
								eventId: payload.eventId
							});

							let createOrUpdate = teamPerson ? TeamPerson.update(newTeamPerson, {where: TeamPersonWhere}) : TeamPerson.create(newTeamPerson);
							createOrUpdate.then(() => {
								server.log('info', `Set team member '${payload.personId}' with event ${payload.eventId} for slot ${request.params.slot} on team '${payload.teamId}'`);
								getTeam({id, week: getWeek()}, team => server.methods.teams.set({id, week: getWeek()}, team));
								if (payload.personId) {
									return Person.findById(payload.personId).then(person => reply(JSON.stringify(person)).code(201));
								} else {
									return reply(null);
								}
							});
						});
					});
				});
			}
		}
	}]);
};
