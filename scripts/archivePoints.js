const weekArg = process.argv[2];
const _ = require('lodash/fp');
const moment = require('moment');
const {Team, TeamPerson, Points, Archive, sequelize} = require('../server/models');
const week = weekArg ? +weekArg : moment().subtract(5, 'days').subtract(9, 'hours').week() - 1;

console.log(`Week: ${week}`);

let getTeamPeoplePoints = `
INSERT INTO Archive (week, teamId, points)
	SELECT ${week} week, teams.teamId, SUM(teams.points) points
	FROM (SELECT tp.week, tp.teamId, tp.slot, tp.personId, tp.eventId, AVG(p.totalPoints) points
		FROM TeamPeople tp
		JOIN Points p ON tp.week=p.week AND tp.personId=p.personId AND tp.eventId=p.eventId AND p.year=2017
		WHERE tp.week=${week}
		GROUP BY tp.week, tp.teamId, tp.slot, tp.personId, tp.eventId) teams
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

sequelize.query(getTeamPeoplePoints, {logging: console.log})
.then(() => sequelize.query(updateTeams, {logging: console.log}))
.then(() => sequelize.close());
