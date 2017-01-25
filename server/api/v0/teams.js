const _ = require('lodash/fp');
const Boom = require('boom');
const shortId = require('shortid');
const moment = require('moment');

const {knex, User, Team, Teams, Person, Pick, Picks} = App.db;
const league = 'Standard';

const isAdmin = (profile) => profile.id === 8184;

const time = (hour, min, sec) => ((hour * 60 + min) * 60 + sec) * 1000;

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
const teamQuery = (teamId, week) => {
	let points = knex('Points').select('personId', 'eventId', knex.raw('TRUNCATE(AVG(totalPoints), 2) AS points')).where({week, year: 2017}).groupBy('personId', 'eventId').as('points');

	return knex('Picks').join('Persons', 'Persons.id', 'Picks.personId').leftJoin(points, 'points.personId', '=', 'Picks.personId', 'points.eventId', 'Picks.eventId')
		.select('Picks.eventId', 'Picks.slot','Picks.personId', 'Persons.name', 'Persons.countryId', 'points')
		.where({teamId, week});
};

/*
 *	key: {
 *		id: (teamId),
 *		week: (number),
 *		points: (true/false)
 *	}
*/
const getWeek = function (key, next) {
	return Team.forge({id: key.id}).fetch({
		withRelated: ['owner']
	}).then(function (team) {
		if (!team) {
			return next(Boom.notFound('Team not found'));
		}

		return team.picks(key.week).then(picks =>
			next(null, {
				owner: team.owner,
				id: team.id,
				name: team.name,
				points: team.points,
				picks: picks
			})
		).catch(error => next(error));
	}).catch(error => next(error));
};

/*
	GET  /teams
	GET  /teams/{id}
	GET  /teams/{id}/week/{week}
	POST /teams
	PUT  /teams/{id}
	PUT  /teams/{id}/week/{week}
*/
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

	server.method('weeks.get', function (key, next) {
		teamCache.get(key, next);
	});

	server.method('weeks.set', function (key, week, next) {
		teamCache.set(key, week, 0, next);
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

				Team.collection().fetch({
					withRelated: 'owner'
				}).then(function (teams) {
					reply(teams.mask('id,name,points,owner(id,name)'));
				});
			}
		}
	}, {
		method: 'GET',
		path: `${base}/teams/{id}`,
		config: {
			handler: function (request, reply) {
				return Team.forge({id: request.params.id}).fetch({withRelated: ['owner']})
				.then(team => {
					if (!team) {
						return reply(Boom.create(404, 'Team Not Found'));
					}

					return reply(team.mask('id,name,points,owner(id,name)'));
				}).catch(err => {
					if (err.message === 'EmptyResponse') {
						return reply(Boom.create(404, 'Team Not Found'));
					}

					reply(err);
				});
			}
		}
	}, {
		method: 'GET',
		path: `${base}/teams/{teamId}/week/{week}`,
		config: {
			auth: {
				strategy: 'session',
				mode: 'try'
			},
			handler: function (request, reply) {
				let profile = request.auth.credentials.profile;
				let {teamId, week} = request.params;

				Team.forge({id: teamId}).fetch({
					withRelated: ['owner']
				}).then(function (team) {
					if (!team) {
						return reply(Boom.notFound('Team not found'));
					}

					let owner = team.related('owner');

					if ((profile && profile.id !== +owner.id) && week >= server.methods.getWeek() && !isAdmin(profile)) {
						return reply(Boom.unauthorized('Not allowed to view current team'));
					}

					return team.getPicks(week).then(picks => reply(_.extend({picks}, team.toJSON())));
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

				if (profile.id !== +owner.id) {
					return reply(Boom.unauthorized('Not allowed to create team'));
				}

				Team.where({owner: owner.id}, {
					require: false
				}).fetch().then(function (team) {
					if (team) {
						return reply(Boom.conflict('Already have a team'));
					}

					return Team.create({
						id: shortId.generate(),
						owner: owner.id,
						name
					}, {method: 'insert'}).then(function (team) {
						return User.update({
							teamId: team.id
						}, {
							id: profile.id
						}).then(function (user) {
							server.log('info', `Created team '${team.name}' (${team.id}) by user ${profile.name} (${profile.id})`);
							return reply(team).code(200);
						});
					});
				}).catch(error => reply(Boom.wrap(error, 500)));
			}
		}
	}, { // update
		method: 'PUT',
		path: `${base}/teams/{teamId}`,
		config: {
			auth: 'session',
			handler: function (request, reply) {
				let profile = request.auth.credentials.profile;
				let {teamId} = request.params;
				let {id, name} = request.payload;

				Team.getWithOwner(teamId).then(function (team) {
					if (!team) {
						return reply(Boom.notFound('Team not found'));
					}

					if (team.owner !== profile.id) {
						return reply(Boom.unauthorized('Not allowed to edit team'));
					}

					server.log('info', `Updated team '${name}' (${team.id}) by user ${profile.id} ${profile.name} (${profile.wca_id})`);
					return team.update({name}).then((team) => reply(team).code(201));
				});
			}
		}
	}, { // Set Cuber
		method: 'PUT',
		path: `${base}/teams/{teamId}/week/{week}`,
		config: {
			auth: 'session',
			handler: function (request, reply) {
				let weekend = server.methods.getWeekend();

				let profile = request.auth.credentials.profile;
				let payload = JSON.parse(request.payload);

				let {teamId, week} = request.params;
				let {owner, slot, eventId, personId} = payload;

				if (owner.id !== profile.id && !isAdmin(profile)) {
					return reply(Boom.unauthorized('Not allowed to edit team'));
				}

				if (week < server.methods.getWeek() && !isAdmin(profile)) {
					return reply(Boom.create(400, 'Too late to edit old team'));
				}

				personId = personId.toUpperCase();
				if (personId !== '' && !personId.match(/^\d{4}[A-Za-z]{4}\d{2}$/)) {
					return reply(Boom.create(400, 'personId is an invalid WCA ID'));
				}

				if (eventId) {
					let c = slot < 2 ? 0 : slot < 6 ? 1 : 2;
					if (classes[c].events.indexOf(eventId) === -1) {
						return reply(Boom.create(400, 'Invalid event selection for class'));
					}
				}

				return Team.findOne({
					owner: owner.id,
					id: teamId
				}).then(function (team) {
					if (!team) {
						return reply(Boom.notFound('Team not found'));
					}

					personId = personId || '';
					eventId = eventId || '';

					let pickWhere = {
						owner: owner.id,
						league,
						teamId,
						slot,
						week
					};

					return Pick.findOne({
						owner: owner.id,
						teamId,
						league,
						personId,
						week
					}, {
						require: false
					}).then(function (alreadyUsedPerson) {
						// Deny person if we already use him. Deduce that we already use him by if he exists in a different slot if it's the same name. If not, then it's ok because we're changing events most likely
						if (alreadyUsedPerson && alreadyUsedPerson.get('personId') !== '' && alreadyUsedPerson.get('slot') !== slot) {
							reply(Boom.badRequest('Person already exists in Team.'));
						} else {
							let pickWhere = {
								owner: owner.id,
								league,
								teamId,
								slot,
								week
							};

							let newPick = {
								personId: personId,
								eventId: eventId
							};

							if (!personId || !eventId) {
								return Pick.where(pickWhere).destroy().then(function () {
									server.log('info', `Cleared slot ${slot} on team '${teamId}'`);
									return reply(null);
								});
							} else {
								return Pick.findOne(pickWhere, {require: false}).then(function (pick) {
									let upsert = pick ?
										Pick.where(pickWhere).save(newPick, {path: true, method: 'update'}) :
										Pick.create(_.extend(pickWhere, newPick), {options: 'insert'});

									upsert.then(function () {
										server.log('info', `${pick ? 'Updated' : 'Created'} pick for slot ${slot} on team '${teamId}' with '${personId}' for event ${eventId}`);
										return Person.findById(personId).then(person => reply(JSON.stringify(person)).code(201));
									});
								});
							}
						}
					});
				});
			}
		}
	}]);
};
