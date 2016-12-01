'use strict';
const faker = require('faker');
const shortId = require('shortid');

let wcaId = (lName) => `${(2000 + Math.floor(Math.random() * 32) - 16)}${lName.slice(0,4).replace(/[^a-zA-Z ]/g, "").toUpperCase()}01`;

const League = [
	{eventId: '333', slots: 3},
	{eventId: '222', slots: 2},
	{eventId: '444', slots: 2},
	{eventId: '555', slots: 2},
	{eventId: '333oh', slots: 2},
	{eventId: '333bf', slots: 2},
	{eventId: '666', slots: 1},
	{eventId: '777', slots: 1},
	{eventId: '333fm', slots: 1},
	{eventId: '333ft', slots: 1},
	{eventId: 'sq1', slots: 1},
	{eventId: 'pyram', slots: 1},
	{eventId: 'skewb', slots: 1},
	{eventId: 'mega', slots: 1},
	{eventId: 'clock', slots: 1},
	{eventId: '444bf', slots: 1},
	{eventId: '555bf', slots: 1},
	{eventId: '333mbf', slots: 1}
];

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
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}

		let teams = users.slice(0,90).map(user => ({
			id: shortId.generate(),
			owner: user.id,
			league: 'Standard',
			name: `${user.name}'s Team`,
			ELO: 1000 + Math.floor(Math.random() * 500) - 750,
			createdAt: new Date(),
			updatedAt: new Date()
		}));

		return queryInterface.bulkInsert('Users', users, {}).then(() =>
			queryInterface.bulkInsert('Teams', teams, {}).then(() =>
				queryInterface.sequelize.query('SELECT * FROM Persons ORDER BY Rand() LIMIT 1000;', { type: queryInterface.sequelize.QueryTypes.SELECT }).then(function (persons) {
					let teamPeople = [];
					teams.forEach(team => {
						League.forEach(event => {
							for (let i = 0; i < event.slots; i++) {
								teamPeople.push({
									owner: team.owner,
									teamId: team.id,
									eventId: event.eventId,
									slot: i,
									personId: persons[Math.floor(Math.random() * persons.length)].id,
									createdAt: new Date(),
									updatedAt: new Date()
								});
							}
						});
					});

					console.log(teamPeople);
					return queryInterface.bulkInsert('TeamPeople', teamPeople);
				})
			)
		);
	},

	down: function (queryInterface, Sequelize) {
		return queryInterface.bulkDelete('Users', null, {}).then(() =>
			queryInterface.bulkDelete('Teams', null, {}).then(() =>
				queryInterface.bulkDelete('TeamPeople', null, {})
			)
		);
	}
};
