const faker = require('faker');
const shortId = require('shortid');
const moment = require('moment');

let rnd = n => Math.floor(Math.random() * n);
let wcaId = (lName) => `${(2000 + rnd(32) - 16)}${lName.slice(0,4).replace(/[^a-zA-Z ]/g, '').toUpperCase()}0${rnd(10)}`;

const {Events} = require('../../lib/wca.js');

exports.seed = function (knex, Promise) {
	let users = [];
	let teams = [];

	for (let i = 0; i < 100; i++) {
		let lName = faker.name.lastName();
		let teamId = shortId.generate();

		let user = {
			id: i,
			wca_id: Math.random() < 0.10 ? null : wcaId(lName),
			name: `${faker.name.firstName()} ${lName}`,
			email: faker.internet.email(),
			avatar: null,
			teamId: teamId
		};

		users.push(user);

		if (i < 90) {
			teams.push({
				id: teamId,
				owner: user.id,
				name: `${user.name}'s Team`,
				points: 0,
				createdAt: new Date(),
				updatedAt: new Date()
			});
		}
	}

	console.log('generated', teams.length, 'teams');

	return knex('Picks').del()
		.then(() => knex('Teams').del())
		.then(() => knex('Users').del())
		.then(() => knex.batchInsert('Users', users))
		.then(() => knex.batchInsert('Teams', teams))
		.then(() => {
			return knex.select('*').from('Persons').limit(20).then(function (persons) {
				let picks = [];
				teams.forEach(team => {
					for (let week = 0; week < 3; week++) {
						for (let i = 0; i < 10; i++) {
							picks.push({
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

				return knex.batchInsert('Picks', picks);
			});
		}).catch(err => console.trace(err));
};
