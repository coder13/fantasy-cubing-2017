'use strict';
const faker = require('faker');
const shortId = require('shortid');
const moment = require('moment');

let wcaId = (lName) => `${(2000 + Math.floor(Math.random() * 32) - 16)}${lName.slice(0,4).replace(/[^a-zA-Z ]/g, "").toUpperCase()}01`;

const {League} = require('../../lib/wca.js')

module.exports = {
	up: function (queryInterface, Sequelize) {
		let users = [];
		for (let i = 0; i < 100; i++) {
			let lName = faker.name.lastName();
			users.push({
				id: i,
				wca_id: Math.random() < 0.10 ? null : wcaId(lName),
				name: `${faker.name.firstName()} ${lName}`,
				email: faker.internet.email(),
				avatar: null,
				// createdAt: new Date(),
				// updatedAt: new Date()
			});
		}

		let teams = users.slice(0,90).map(user => ({
			id: shortId.generate(),
			owner: user.id,
			league: 'Standard',
			name: `${user.name}'s Team`,
			ELO: 1500,
			createdAt: new Date(),
			updatedAt: new Date()
		}));

		console.log('generated', teams.length, 'teams');

		return queryInterface.bulkInsert('Users', users, {}).then(() => {
			console.log(39)
			return queryInterface.bulkInsert('Teams', teams, {}).then(() =>
				queryInterface.sequelize.query('SELECT * FROM Persons ORDER BY Rand() LIMIT 2000;', {type: queryInterface.sequelize.QueryTypes.SELECT}).then(function (persons) {
					let teamPeople = [];
					for (let week = 0; week < 3; week++) {
						console.log('week', week)
						teams.forEach(team => {
							League.forEach(event => {
								for (let i = 0; i < event.slots; i++) {
									teamPeople.push({
										owner: team.owner,
										teamId: team.id,
										eventId: event.eventId,
										slot: i,
										week: moment().week() - week,
										personId: persons[Math.floor(Math.random() * persons.length)].id,
										createdAt: new Date(),
										updatedAt: new Date()
									});
								}
							});
						});
					}

					console.log(teamPeople);
					return queryInterface.bulkInsert('TeamPeople', teamPeople);
				})
			).catch(err => console.trace(err));
		});
	},

	down: function (queryInterface, Sequelize) {
		return queryInterface.bulkDelete('Users', null, {}).then(() =>
			queryInterface.bulkDelete('Teams', null, {}).then(() =>
				queryInterface.bulkDelete('TeamPeople', null, {})
			)
		);
	}
};
