'use strict';

const _ = require('lodash/fp');
const Boom = require('boom');
const shortId = require('shortid');

const Team = App.models.Team;
const TeamPeople = App.models.TeamPeople;

const createTeam = function (owner, name) {
	return {
		owner, name, id: shortId.generate()
	};
};

const base = '/api/v0';

module.exports = [{
	method: 'GET',
	path: `${base}/teams`,
	config: {
		handler: function (request, reply) {
		}
	}
}, {
	method: 'GET',
	path: `${base}/teams/{userId}`,
	config: {
		auth: 'session',
		handler: function (request, reply) {
			// let profile = request.auth.credentials.profile;
			Team.findOne({
				where: {
					owner: request.params.userId
				}
			}).then(function (team) {
				if (team) {
					TeamPeople.findAll({
						where: {
							owner: team.owner,
							teamId: team.id
						},
						include: [App.models.Persons]
					}).then(function (people) {
						reply({
							owner: team.owner,
							id: team.id,
							name: team.name,
							cubers: _.chain(people).map(i => ({
								eventId: i.eventId,
								slot: i.slot,
								personId: i.personId,
								name: i.Person.name,
								countryId: i.Person.countryId
							})).keyBy((i) => `${i.eventId}-${i.slot}`).value()
						}).code(201);
					});
				} else {
					reply().code(404);
				}
			});
		}
	}
}, { // create
	method: 'POST',
	path: `${base}/teams/{userId}`,
	config: {
		auth: 'session',
		handler: function (request, reply) {
			let profile = request.auth.credentials.profile;

			if (profile.id !== parseInt(request.params.userId)) {
				return reply().code(401);
			}

			let where = {
				owner: profile.id
			};

			Team.create({
				id: shortId.generate(),
				owner: profile.id,
				name: request.payload.name
			}).then(function (team) {
				console.log(`Created team '${request.payload.name}' for user ${profile.id} ${profile.name} (${profile.wca_id})`);
				reply(team).code(200);
			});
		}
	}
}, { // update
	method: 'PUT',
	path: `${base}/teams/{userId}`,
	config: {
		auth: 'session',
		handler: function (request, reply) {
			let profile = request.auth.credentials.profile;
			let payload = JSON.parse(request.payload);

			if (profile.id !== parseInt(request.params.userId)) {
				return reply().code(401);
			}

			let where = {
				owner: profile.id,
				id: payload.id
			};

			Team.findOne({where}).then(function (team) {
				if (team) {
					Team.update(_.extend(where, {name: request.payload.name}), {where}).then(function () {
						console.log(`Updated team '${payload.name}' for user ${profile.id} ${profile.name} (${profile.wca_id})`);
						reply().code(201);
					});
				} else {
					reply().code(400);
				}
			});
		}
	}
}, { // Set
	method: 'PUT',
	path: `${base}/teams/{userId}/{eventId}/{slot}`,
	config: {
		auth: 'session',
		handler: function (request, reply) {
			let profile = request.auth.credentials.profile;
			let payload = JSON.parse(request.payload);

			if (profile.id !== parseInt(request.params.userId)) {
				return reply().code(401);
			}

			let where = {
				owner: profile.id,
				id: payload.teamId
			};

			Team.findOne({where}).then(function (team) {
				if (team) {
					let teamPeopleWhere = {
						teamId: payload.teamId,
						owner: request.params.userId,
						eventId: request.params.eventId,
						slot: request.params.slot
					};

					TeamPeople.find({where: teamPeopleWhere}).then(function (teamPerson) {
						let newTeamPerson = _.extend(teamPeopleWhere, {
							personId: payload.personId
						});

						(teamPerson ? TeamPeople.update(newTeamPerson, {where: teamPeopleWhere}) : TeamPeople.create(newTeamPerson))
						.then(function () {
							console.log(`Updated team member '${payload.personId}' in ${request.params.eventId}-${request.params.slot} for team '${payload.teamId}'`);
							App.sequelize.query(`SELECT id,subid,name,countryId FROM Persons where id='${payload.personId}'`).then(function (persons) {
								return reply(JSON.stringify({
									name: persons[0][0].name,
									country: persons[0][0].countryId
								})).code(201);
							});
						});
					});
				} else {
					reply().code(400);
				}
			});
		}
	}
}];

// Team.findOne({where}).then(function (cuber) {
// 	let newCuber = {
// 		owner: request.params.userId,
// 		// teamId: request.params.id,
// 		eventId: payload.event,
// 		slot: payload.slot,
// 		personId: payload.personId
// 	};

// 	let cb = function () {
// 		App.sequelize.query(`SELECT id,subid,name,countryId FROM Persons where id="${payload.personId}"`).then(function (persons) {
// 			return reply(JSON.stringify({
// 				name: persons[0][0].name,
// 				country: persons[0][0].countryId
// 			})).code(201);
// 		});
// 	};

// 	if (!cuber) { // not found, now create
// 		Team.create(newCuber).then(cb);
// 	} else { // found, now update
// 		Team.update(newCuber, {where}).then(cb);
// 	}
// });