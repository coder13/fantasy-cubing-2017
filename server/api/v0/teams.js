'use strict';

const _ = require('lodash/fp');
const Boom = require('boom');
const shortId = require('shortid');
const moment = require('moment');

const {User, Team, Person, TeamPerson} = App.db;

const createTeam = function (owner, name) {
	return {
		owner, name, id: shortId.generate()
	};
};

const getWeek = () => moment().week();

module.exports = (base) => [{
	method: 'GET',
	path: `${base}/teams`,
	config: {
		handler: function (request, reply) {
			Team.findAll({
				where: {
					league: 'Standard'
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
			Team.findById(request.params.id).then(function (team) {
				if (!team) {
					return reply(Boom.notFound('Team not found', 400));
				}

				return TeamPerson.findAll({
					where: {
						owner: team.owner,
						teamId: team.id
					},
					include: [App.db.Person]
				}).then(function (people) {
					reply({
						owner: team.owner,
						id: team.id,
						name: team.name,
						wins: team.wins,
						losses: team.losses,
						ties: team.ties,
						ELO: team.ELO,
						cubers: _.chain(people).map(i => ({
							eventId: i.eventId,
							slot: i.slot,
							personId: i.personId,
							name: i.Person.name,
							countryId: i.Person.countryId
						})).keyBy((i) => `${i.eventId}-${i.slot}`).value()
					}).code(201);
				}).catch(error => reply(Boom.wrap(error, 500)).code(500));
			}).catch(error => reply(Boom.wrap(error, 500)).code(500));
		}
	}
}, { // create
	method: 'POST',
	path: `${base}/teams/`,
	config: {
		auth: 'session',
		handler: function (request, reply) {
			let profile = request.auth.credentials.profile;

			Team.create({
				id: shortId.generate(),
				owner: profile.id,
				name: request.payload.name,
				league: 'Standard' // TODO: update for support for multiple leagues
			}).then(function (team) {
				console.log(`Created team '${request.payload.name}' for user ${profile.id} ${profile.name} (${profile.wca_id})`);
				reply(team).code(200);
			});
		}
	}
}, { // update
	method: 'PUT',
	path: `${base}/teams/{id}`,
	config: {
		auth: 'session',
		handler: function (request, reply) {
			let profile = request.auth.credentials.profile;
			let payload = JSON.parse(request.payload);

			let where = {
				owner: profile.id,
				id: payload.id
			};

			Team.findById(request.params.id).then(function (team) {
				if (!team) {
					return reply(Boom.notFound('Team not found'));
				}

				if (team.owner !== profile.id) {
					return reply(Boom.unauthorized('Not allowed to edit team'));
				}

				return Team.update(_.extend(where, {name: request.payload.name}), {where}).then(function () {
					console.log(`Updated team '${payload.name}' for user ${profile.id} ${profile.name} (${profile.wca_id})`);
					return reply().code(201);
				});
			});
		}
	}
}, { // Set Cuber
	method: 'PUT',
	path: `${base}/teams/{id}/{eventId}/{slot}`,
	config: {
		auth: 'session',
		handler: function (request, reply) {
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
					if (alreadyUsedPerson) {
						return reply(Boom.badRequest('Person already exists in Team.'));
					}

					return TeamPerson.find({where: TeamPersonWhere}).then(function (teamPerson) {
						let newTeamPerson = _.extend(TeamPersonWhere, {
							personId: payload.personId
						});

						let createOrUpdate = teamPerson ? TeamPerson.update(newTeamPerson, {where: TeamPersonWhere}) : TeamPerson.create(newTeamPerson);
						createOrUpdate.then(() => {
							console.log(`Updated team member '${payload.personId}' in ${request.params.eventId}-${request.params.slot} for team '${payload.teamId}'`);
							Person.findById(payload.personId).then(person => reply(JSON.stringify(person)).code(201));
						});
					});
				});
			});
		}
	}
}];
