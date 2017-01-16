const weekArg = process.argv[2];
const _ = require('lodash/fp');
const moment = require('moment');
const {knex} = require('../server/db');
const week = weekArg ? +weekArg : moment().subtract(5, 'days').subtract(9, 'hours').week();

console.log(`Week: ${week}`);

let getTeamPeoplePoints = `
INSERT INTO Archive (week, teamId, points)
	SELECT ${week} week, teams.teamId, SUM(teams.points) points
	FROM (SELECT picks.week, picks.teamId, picks.slot, picks.personId, picks.eventId, AVG(p.totalPoints) points
		FROM Picks picks
		JOIN Points p ON picks.week=p.week AND picks.personId=p.personId AND picks.eventId=p.eventId AND p.year=2017
		WHERE picks.week=${week}
		GROUP BY picks.week, picks.teamId, picks.slot, picks.personId, picks.eventId) teams
	GROUP BY teams.teamId
ON DUPLICATE KEY UPDATE
	points = values(points),
	updatedAt = NOW();
`;

let updateTeams = `
UPDATE Teams teams
LEFT JOIN (SELECT teamId, SUM(points) points FROM Archive GROUP BY teamId) points ON
	teams.id = points.teamId
SET
	teams.points = points.points,
	teams.updatedAt = NOW();
`;

knex.raw(getTeamPeoplePoints)
.then(() => knex.raw(updateTeams))
.then(function () {
	return console.log('done')
}).catch(err => console.trace(err));
