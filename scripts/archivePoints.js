const weekArg = process.argv[2];
const _ = require('lodash');
const moment = require('moment');
const {knex} = require('../server/db');
const week = weekArg ? +weekArg : moment().subtract(5, 'days').subtract(9, 'hours').week();

console.log(`Week: ${week}`);

const getPeople = (week) => {
	let picks = knex('Picks').select('personId', 'eventId').where({week}).groupBy('personId', 'eventId').as('picks');
	return knex(picks).select('picks.personId', 'picks.eventId', knex.avg('totalPoints').as('points')).leftJoin('Points', function () {
		this.on('picks.personId', '=', 'Points.personId').on('picks.eventId', '=', 'Points.eventId').on('Points.week', '=', week);
	}).groupBy('picks.personId', 'picks.eventId');
};

const getTeamPicks = (week) => knex('Picks').select('personId', 'eventId', 'teamId').where({week}).then((results) => _(results).groupBy('teamId').value());

let updateTeams = () => knex.raw(`
UPDATE Teams teams
LEFT JOIN (SELECT teamId, SUM(points) points FROM Archive GROUP BY teamId) points ON
	teams.id = points.teamId
SET
	teams.points = points.points,
	teams.updatedAt = NOW();
`);

getPeople(week).then(people => {
	getTeamPicks(week).then(teams => {
		return Promise.all(_.map(teams, (team, teamId) => {
			let totalPoints = _(team).map(pick => people.find(person => person.personId === pick.personId).points).sum();

			if (totalPoints) {
				return knex.raw('INSERT INTO Archive (week, teamId, points) VALUES (:week, :teamId, :totalPoints) ON DUPLICATE KEY UPDATE teamId=VALUES(teamId), week=VALUES(week);');
			} else {
				return Promise.resolve();
			}
		}));
	});
})
.then(updateTeams)
.then(knex.destroy)
.catch(err => console.trace(err));
