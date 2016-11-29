process.env.NODE_ENV = 'dev';

const _ = require('lodash');
const db = require('../server/models/');
const moment = require('moment');
const Table = require('cli-table');

const compare = (a,b) => a < b ? -1 : (a > b ? 1 : 0);

const week = moment().week() - 1;

const competitors = {};

let date = `DATE_SUB(DATE_ADD(MAKEDATE(2016, 1), INTERVAL ${week - 1} WEEK), INTERVAL WEEKDAY( DATE_ADD(MAKEDATE(2016, 1), INTERVAL ${week - 1} WEEK) ) -4 DAY)`;
db.sequelize.query(`
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
ORDER BY compPoints DESC;`).then(function (results) {
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
	const table = new Table({
		head: ['name', 'total', '222', '333', '444', '555', '666', '777', '333oh', '333bf', '333fm', '333ft', 'sq1', 'pyram', 'skewb', 'minx', 'clock', '444bf', '555bf', '333mbf']
	});

	table.push(...Object.keys(competitors).sort((i,j) => -compare(competitors[i].total, competitors[j].total)).slice(0,25).map(id => {
		let person = competitors[id];
		console.log([person.name, person['222'] || 0, person['333'] || 0])
		return [person.name, person.total, person['222'] || 0, person['333'] || 0, person['444'] || 0, person['555'] || 0, person['666'] || 0, person['777'] || 0, person['333oh'] || 0, person['333bf'] || 0, person['333fm'] || 0, person['333fm'] || 0, person['sq1'] || 0, person['pyram'] || 0, person['skewb'] || 0, person['minx'] || 0, person['clock'] || 0, person['444bf'] || 0, person['555bf'] || 0, person['mbf'] || 0]
	}))

	console.log(table.toString());
})

// db.Team.findAll({
// 	league: 'Standard'
// }).then(function (teams) {
// 	console.log(teams.length);
// }).then(() => db.sequelize.close());