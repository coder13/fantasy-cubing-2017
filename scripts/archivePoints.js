const weekArg = process.argv[2];
const _ = require('lodash');
const moment = require('moment');
const {knex} = require('../server/db');
const week = weekArg ? +weekArg : moment().subtract(5, 'days').subtract(9, 'hours').week();
const {season, getClasses} = require('../lib/rules');

console.log(`Week: ${week}`);

const getPeople = (week) => {
	let picks = knex('Picks').select('personId', 'eventId').where({week}).groupBy('personId', 'eventId').as('picks');
	return knex(picks).select('picks.personId', 'picks.eventId', knex.avg('totalPoints').as('points')).leftJoin('Points', function () {
		this.on('picks.personId', '=', 'Points.personId').on('picks.eventId', '=', 'Points.eventId').on('Points.week', '=', week);
	}).groupBy('picks.personId', 'picks.eventId');
};

const getTeamPicks = (week) => knex('Picks').select('personId', 'eventId', 'teamId').where({week}).then((results) => _(results).groupBy('teamId').value());

const compare = (a,b) => a < b ? 1 : a > b ? -1 : 0;
const sum = (a,b) => a + b;


let updateTeams = () => knex.raw(`
UPDATE Teams teams
LEFT JOIN (SELECT teamId, SUM(points) points FROM Archive GROUP BY teamId) points ON
	teams.id = points.teamId
SET
	teams.points = points.points,
	teams.updatedAt = NOW();
`);

getPeople(week).then(people => {
	const findPerson = pick => people.find(person => person.personId === pick.personId && person.eventId === pick.eventId);

	const computeTotalPoints = function (season, team) {
		if (season === 1) {
			return _(team).map(pick => findPerson(pick).points).sum();
		} else {
			let classes = getClasses(week);
			return classes.map(clas => team.filter(pick => clas.events.indexOf(pick.eventId) > -1).map(pick => findPerson(pick).points).sort(compare).slice(0, -1).reduce(sum, 0)).reduce(sum, 0);
		}
	};

	getTeamPicks(week).then(teams => {
		return Promise.all(_.map(teams, (team, teamId) => {
			let totalPoints = computeTotalPoints(season(week), team);

			if (totalPoints !== undefined) {
				return knex.raw(`INSERT INTO Archive (week, teamId, points, season) VALUES (${week}, '${teamId}', ${totalPoints}, ${week < 14 ? 1 : 2}) ON DUPLICATE KEY UPDATE points=${totalPoints};`);
			} else {
				return Promise.resolve();
			}
		}));
	});
})
.then(updateTeams)
.then(knex.destroy)
.catch(err => console.trace(err));
