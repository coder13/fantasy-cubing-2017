const faker = require('faker');
const shortId = require('shortid');
const moment = require('moment');

let wcaId = (lName) => `${(2000 + Math.floor(Math.random() * 32) - 16)}${lName.slice(0,4).replace(/[^a-zA-Z ]/g, '').toUpperCase()}01`;

const {Events} = require('../../lib/wca.js');

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
				avatar: null
			});
		}

		let teams = users.slice(0,90).map(user => ({
			id: shortId.generate(),
			owner: user.id,
			league: 'Standard',
			name: `${user.name}'s Team`,
			points: 0,
			createdAt: new Date(),
			updatedAt: new Date()
		}));

		console.log('generated', teams.length, 'teams');

		return queryInterface.bulkInsert('Users', users, {}).then(() =>
			queryInterface.bulkInsert('Teams', teams, {})
		).then(() => {
			return queryInterface.sequelize.query('SELECT * FROM Persons ORDER BY Rand() LIMIT 2000;', {type: queryInterface.sequelize.QueryTypes.SELECT}).then(function (persons) {
				let teamPeople = [];
				teams.forEach(team => {
					for (let week = 0; week < 3; week++) {
						for (let i = 0; i < 10; i++) {
							teamPeople.push({
								owner: team.owner,
								teamId: team.id,
								week: moment().week() - week,
								slot: i,
								personId: persons[Math.floor(Math.random() * persons.length)].id,
								eventId: i < 2 ? 333 : (i < 6 ? ['444', '555', '222', 'pyra', 'skewb', '333oh', '333bf'][~~(Math.random() * 7)] : ['minx', 'sq1', '666', '777', '333ft', '333fm', '444bf', '555bf', '333mbf'][~~(Math.random() * 9)]),
								createdAt: new Date(),
								updatedAt: new Date()
							});
						}
					}
				});

				console.log(teamPeople);
				return queryInterface.bulkInsert('TeamPeople', teamPeople);
			});
		}).catch(err => console.trace(err));
	},

	down: function (queryInterface, Sequelize) {
		return queryInterface.bulkDelete('Users', null, {}).then(() =>
			queryInterface.bulkDelete('Teams', null, {}).then(() =>
				queryInterface.bulkDelete('TeamPeople', null, {})
			)
		);
	}
};
