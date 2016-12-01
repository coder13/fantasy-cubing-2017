// process.env.NODE_ENV = 'dev';

const _ = require('lodash');
const db = require('../server/models/');
const moment = require('moment');
const Table = require('cli-table');

const compare = (a,b) => a < b ? -1 : (a > b ? 1 : 0);
const sum = (a,b) => a + b;

const Week = moment().week() - 1;

const competitors = {};

const getWeekendPointsQuery = (week) => {
	let date = `DATE_SUB(DATE_ADD(MAKEDATE(2016, 1), INTERVAL ${week - 1} WEEK), INTERVAL WEEKDAY( DATE_ADD(MAKEDATE(2016, 1), INTERVAL ${week - 1} WEEK) ) -4 DAY)`;
	return `
	SELECT personId, personName, eventId,
	SUM(wrSinglePoints) wrSinglePoints,
	SUM(wrAveragePoints) wrAveragePoints,
	SUM(crSinglePoints) crSinglePoints,
	SUM(crAveragePoints) crAveragePoints,
	SUM(nrSinglePoints) nrSinglePoints,
	SUM(nrAveragePoints) nrAveragePoints,
	SUM(compPoints) compPoints
	FROM (SELECT * FROM Points where compPoints > 0 AND date >= ${date} AND date <= DATE_ADD(${date}, INTERVAL 7 DAY)) p
	GROUP BY personId, personName, eventId
	ORDER BY compPoints DESC;`;
};

db.sequelize.query(getWeekendPointsQuery(Week)).then(function (results) {
	results[0].forEach(function (result) {
		if (!competitors[result.personId]) {
			competitors[result.personId] = {
				name: result.personName,
				total: 0
			};
		}

		competitors[result.personId][result.eventId] =
			result.compPoints +
			result.wrSinglePoints +
			result.wrAveragePoints +
			result.crSinglePoints +
			result.crAveragePoints +
			result.nrSinglePoints +
			result.nrAveragePoints;
		competitors[result.personId].total += competitors[result.personId][result.eventId];
	});
}).then(() => {
	// console.log(competitors);
	// const table = new Table({
	// 	head: ['name', 'total', '222', '333', '444', '555', '666', '777', '333oh', '333bf', '333fm', '333ft', 'sq1', 'pyram', 'skewb', 'minx', 'clock', '444bf', '555bf', '333mbf']
	// });

	// table.push(...Object.keys(competitors).sort((i,j) => -compare(competitors[i].total, competitors[j].total)).slice(0,25).map(id => {
	// 	let person = competitors[id];
	// 	console.log([person.name, person['222'] || 0, person['333'] || 0])
	// 	return [person.name, person.total, person['222'] || 0, person['333'] || 0, person['444'] || 0, person['555'] || 0, person['666'] || 0, person['777'] || 0, person['333oh'] || 0, person['333bf'] || 0, person['333fm'] || 0, person['333fm'] || 0, person['sq1'] || 0, person['pyram'] || 0, person['skewb'] || 0, person['minx'] || 0, person['clock'] || 0, person['444bf'] || 0, person['555bf'] || 0, person['mbf'] || 0]
	// }))

	// console.log(table.toString());
}).then(() => {
	return db.Matchup.findAll({
		attributes: ['home', 'away', 'week', 'league'],
		where: {
			league: 'Standard',
			week: moment().week(),
		}
	});
}).then(matchups => {
	matchups.forEach(matchup => {
		// console.log(81, matchup.homeTeam)
		let homeTeamPoints = 0;
		let awayTeamPoints = 0;
		return db.TeamPerson.findAll({
			where: {
				teamId: matchup.home
			}
		}).then(function (people) {
			homeTeamPoints = people.map(i => competitors[i.personId] ? competitors[i.personId].total : 0).reduce(sum);

			return db.TeamPerson.findAll({
				where: {
					teamId: matchup.away
				}
			}).then(function (people) {
				awayTeamPoints = people.map(i => competitors[i.personId] ? competitors[i.personId].total : 0).reduce(sum);


				let winner = homeTeamPoints > awayTeamPoints ? matchup.home :
										 homeTeamPoints < awayTeamPoints ? matchup.away : '';
				db.Matchup.update({
					winner: winner
				}, {
					where: {
						home: matchup.home,
						away: matchup.away,
						week: moment().week()
					},
					fields: ['winner']
				});
			});
		});
	});
});
	//.then(() => db.sequelize.close());