const weekArg = process.argv[2];
const _ = require('lodash/fp');
const moment = require('moment');
const {TeamPerson, Points, Archive, sequelize} = require('../server/models');
const week = weekArg ? +weekArg : moment().subtract(5, 'days').week() - 1;

console.log(`Week: ${week}`);

TeamPerson.findAll({
	where: {week}
}).then(function (people) {
	let teams = _.chain(people).map(p => p.teamId).uniq().map(t => ({
		teamId: t,
		week: week,
		points: 0
	})).value();

	return Points.findAll({
		where: {
			year: 2016,
			week: week
		}
	}).then(function (points) {
		people.forEach(function (person) {
			let pops = points.filter(p => p.personId === person.personId && p.eventId === person.eventId) || [];
			let personPoints = pops.length ? _(pops).map(p => p.totalPoints).sum() / pops.length : 0;

			teams[teams.findIndex(t => t.teamId === person.teamId)].points += personPoints;
		});

		return Promise.all(teams.map(team => Archive.upsert(team)));
	});
}).then(() => sequelize.close());
