const _ = require('lodash');
const db = require('../server/models/');

let compare = (a,b) => a < b ? -1 : (a > b ? 1 : 0);

const WEEK = 0;
const LEAGUE = 'Standard';

db.User.findAll({
	include: [{
		model: db.Team,
		where: {
			league: LEAGUE
		}
	}]
}).then(function (users) {
	users = users.filter(user => !!user.Teams.length).sort((a,b) => compare(a.Teams[0].ELO, b.Teams[0].ELO));
	if (!users.length) {
		return console.error('No Users');
	}

	console.log('Making matchups for the Standard league.');

	do {
		let userA = users[0];
		let m = Math.floor(Math.random() * (1 / 10 * users.length)) + 1;
		let userB = users[m];
		console.log(userA);
		db.Matchup.create({
			home: userA.Teams[0].id,
			away: userB.Teams[0].id,
			league: LEAGUE,
			week: WEEK
		});

		users.splice(m,1);
		users.splice(0,1);
	} while (users.length > 1);

}).then();
