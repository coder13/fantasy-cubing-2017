'use strict';
const faker = require('faker');
const shortId = require('shortid');

let wcaId = (lName) => `${(2000 + Math.floor(Math.random() * 32) - 16)}${lName.slice(0,4).replace(/[^a-zA-Z ]/g, "").toUpperCase()}01`;

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

		return queryInterface.bulkInsert('Users', users, {}).then(() => {
			return queryInterface.bulkInsert('Teams', users.slice(0,90).map((user => ({
				id: shortId.generate(),
				owner: user.id,
				league: 'Standard',
				name: `${user.name}'s Team`,
				ELO: 1000 + Math.floor(Math.random() * 500) - 750,
				createdAt: new Date(),
				updatedAt: new Date()
			})), {}));
		});
	},

	down: function (queryInterface, Sequelize) {
		/*
			Add reverting commands here.
			Return a promise to correctly handle asynchronicity.

			Example:
		*/
		return queryInterface.bulkDelete('Users', null, {}).then(() =>
			queryInterface.bulkDelete('Teams', null, {})
		);
	}
};
